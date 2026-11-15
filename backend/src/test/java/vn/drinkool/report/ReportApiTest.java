package vn.drinkool.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.assertj.core.data.Offset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import tools.jackson.databind.JsonNode;

import vn.drinkool.IntegrationTest;

/** Đơn được đặt qua API rồi dời {@code paid_at} về các ngày cố định của tháng 3/2026. */
class ReportApiTest extends IntegrationTest {

    private static final String COFFEE = """
            {"type":"PRODUCT","id":1,"quantity":1,"unitPrice":25000,"optionValueIds":[1,3,8]}""";
    private static final String TEA = """
            {"type":"PRODUCT","id":5,"quantity":2,"unitPrice":46000,"optionValueIds":[2,5,9,11]}""";
    private static final String COMBO = """
            {"type":"COMBO","id":1,"quantity":1,"unitPrice":81000,
             "components":[{"no":1,"optionValueIds":[1,3,8]},{"no":2,"optionValueIds":[2,3,8]}]}""";
    /** Cà phê trứng chưa nhập giá vốn (BR-10). */
    private static final String EGG = """
            {"type":"PRODUCT","id":4,"quantity":1,"unitPrice":45000,"optionValueIds":[1]}""";

    @Autowired
    private JdbcClient jdbc;

    private String staff;

    private long paidOrder(String line, String paidAt) throws Exception {
        String body = "{\"paymentMethod\":\"CASH\",\"items\":[" + line + "]}";
        JsonNode o = json.readTree(mvc.perform(MockMvcRequestBuilders.post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON).content(body)
                        .header("Idempotency-Key", UUID.randomUUID().toString()))
                .andReturn().getResponse().getContentAsString());
        if (staff == null) {
            staff = staffToken("an", "123456");
        }
        long id = o.get("id").asLong();
        if (paidAt != null) {
            call(POST, "/api/v1/orders/" + id + "/payment/confirm", staff,
                    "{\"method\":\"CASH\",\"amount\":" + o.get("total").asLong() + ",\"version\":1}")
                    .andExpect(status().isOk());
            flush();
            jdbc.sql("UPDATE customer_order SET paid_at = CAST(? AS timestamptz) WHERE id = ?")
                    .params(paidAt, id).update();
        }
        return id;
    }

    /** Tháng 3: 4 đơn tính doanh thu. Tháng 2: 1 đơn. Còn lại là các đơn không được tính. */
    private void seed() throws Exception {
        paidOrder(COFFEE, "2026-03-10T10:00:00+07:00");
        paidOrder(TEA, "2026-03-31T23:30:00+07:00");
        paidOrder(COMBO, "2026-03-15T08:00:00+07:00");
        paidOrder(EGG, "2026-03-20T09:00:00+07:00");
        paidOrder(COFFEE, "2026-02-20T09:00:00+07:00");
        // 00:10 ngày 1/4 giờ quán vẫn là 31/3 theo UTC, nhưng thuộc tháng 4
        paidOrder(COFFEE, "2026-04-01T00:10:00+07:00");
        paidOrder(COFFEE, null);
        long refunded = paidOrder(COFFEE, "2026-03-12T10:00:00+07:00");
        call(POST, "/api/v1/orders/" + refunded + "/cancel", managerToken(),
                "{\"version\":2,\"reason\":\"Khách đổi ý\"}").andExpect(status().isOk());
        flush();
    }

    @Test
    void summaryComparesWithPreviousPeriod() throws Exception {
        seed();
        String manager = managerToken();
        JsonNode s = json.readTree(call(GET, "/api/v1/reports/summary?period=month&date=2026-03-05", manager, null)
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        long revenue = 25000 + 92000 + 81000 + 45000;
        assertThat(s.get("revenue").get("current").asDouble()).isEqualTo(revenue);
        assertThat(s.get("revenue").get("previous").asDouble()).isEqualTo(25000);
        assertThat(s.get("revenue").get("changePercent").asDouble())
                .isCloseTo((revenue - 25000) * 100.0 / 25000, Offset.offset(1e-9));
        assertThat(s.get("orders").get("current").asDouble()).isEqualTo(4);
        // BR-51: (25 000 − 10 000) + 2 × (46 000 − 17 000) + (81 000 − 38 500) + 45 000
        assertThat(s.get("grossProfit").get("current").asDouble()).isEqualTo(15000 + 58000 + 42500 + 45000);
        assertThat(s.get("averageOrderValue").asDouble()).isEqualTo(revenue / 4.0);

        call(GET, "/api/v1/reports/summary?period=month&date=2026-02-01", manager, null)
                .andExpect(jsonPath("$.revenue.current").value(25000.0))
                .andExpect(jsonPath("$.revenue.changePercent").isEmpty());
        call(GET, "/api/v1/reports/summary?period=day&date=2026-03-10", manager, null)
                .andExpect(jsonPath("$.orders.current").value(1.0));
        call(GET, "/api/v1/reports/summary?period=quarter", manager, null).andExpect(status().isBadRequest());
        call(GET, "/api/v1/reports/summary?date=10/03/2026", manager, null).andExpect(status().isBadRequest());
        call(GET, "/api/v1/reports/summary", staffToken("an", "123456"), null).andExpect(status().isForbidden());
    }

    @Test
    void revenueSeriesAndCategories() throws Exception {
        seed();
        String manager = managerToken();
        JsonNode r = json.readTree(call(GET, "/api/v1/reports/revenue?period=month&date=2026-03-05", manager, null)
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        JsonNode cur = r.get("currentHalf");
        JsonNode prev = r.get("previousHalf");
        assertThat(cur.size()).isEqualTo(31);
        assertThat(prev.size()).isEqualTo(31);
        assertThat(r.get("series").size()).isEqualTo(62);
        assertThat(cur.get(0).get("label").asString()).isEqualTo("01/03");
        assertThat(cur.get(9).get("revenue").asLong()).isEqualTo(25000);
        assertThat(cur.get(30).get("revenue").asLong()).isEqualTo(92000);
        assertThat(prev.get(19).get("label").asString()).isEqualTo("20/02");
        assertThat(prev.get(19).get("orders").asLong()).isEqualTo(1);
        // Tháng 2/2026 có 28 ngày, ba mốc cuối để trống
        assertThat(prev.get(28).get("label").asString()).isEmpty();
        assertThat(r.get("series").get(31).get("label").asString()).isEqualTo("01/03");

        JsonNode cats = r.get("byCategory");
        assertThat(cats.get(0).get("name").asString()).isEqualTo("Trà");
        assertThat(cats.get(0).get("revenue").asLong()).isEqualTo(92000);
        assertThat(cats.findValuesAsString("name")).contains("Combo");
        JsonNode combo = null;
        for (JsonNode c : cats) {
            if (c.get("name").asString().equals("Combo")) {
                combo = c;
            }
        }
        assertThat(combo.get("categoryId").isNull()).isTrue();

        call(GET, "/api/v1/reports/revenue?period=day&date=2026-03-10", manager, null)
                .andExpect(jsonPath("$.currentHalf.length()").value(24))
                .andExpect(jsonPath("$.currentHalf[10].label").value("10:00"))
                .andExpect(jsonPath("$.currentHalf[10].revenue").value(25000));
        call(GET, "/api/v1/reports/revenue?period=year&date=2026-03-10", manager, null)
                .andExpect(jsonPath("$.currentHalf.length()").value(12))
                .andExpect(jsonPath("$.currentHalf[2].label").value("T3"))
                .andExpect(jsonPath("$.currentHalf[3].revenue").value(25000));
        call(GET, "/api/v1/reports/revenue?period=week&date=2026-03-11", manager, null)
                .andExpect(jsonPath("$.currentHalf.length()").value(7))
                .andExpect(jsonPath("$.currentHalf[0].label").value("09/03"));
    }

    @Test
    void productSalesFlagMissingCost() throws Exception {
        seed();
        String manager = managerToken();
        String path = "/api/v1/reports/product-sales?period=month&date=2026-03-05";
        call(GET, path, manager, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].productId").value(5))
                .andExpect(jsonPath("$[0].unitsSold").value(2))
                .andExpect(jsonPath("$[0].revenue").value(92000))
                .andExpect(jsonPath("$[0].costPrice").value(17000))
                .andExpect(jsonPath("$[0].sellingPrice").value(46000))
                .andExpect(jsonPath("$[0].profit").value(58000))
                .andExpect(jsonPath("$[0].missingCost").value(false))
                .andExpect(jsonPath("$[1].productId").value(4))
                .andExpect(jsonPath("$[1].missingCost").value(true))
                .andExpect(jsonPath("$[1].profitMargin").value(100.0));
        call(GET, path + "&categoryId=2", manager, null)
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Trà Đào Cam Sả"));
    }

    @Test
    void laborCostCountsPaidAssignmentsOfOpenShifts() throws Exception {
        String manager = managerToken();
        long monday = shift(1, "2026-03-10", manager);
        long sunday = shift(2, "2026-03-15", manager);
        long cancelled = shift(1, "2026-03-11", manager);
        long nextWeek = shift(1, "2026-03-16", manager);
        assign(monday, 1, "REGISTERED");
        assign(monday, 2, "ATTENDED");
        assign(monday, 3, "ABSENT");
        assign(monday, 4, "LEAVE_APPROVED");
        assign(sunday, 4, "LEAVE_REQUESTED");
        assign(cancelled, 2, "REGISTERED");
        assign(nextWeek, 2, "REGISTERED");
        jdbc.sql("UPDATE shift SET status = 'CANCELLED' WHERE id = ?").param(cancelled).update();

        call(GET, "/api/v1/reports/labor-cost?weekStart=2026-03-11", manager, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weekStart").value("2026-03-09"))
                .andExpect(jsonPath("$.total").value(360000))
                .andExpect(jsonPath("$.byDepartment.length()").value(4))
                .andExpect(jsonPath("$.byDepartment[0].total").value(240000))
                .andExpect(jsonPath("$.byDepartment[1].total").value(120000))
                .andExpect(jsonPath("$.byDepartment[2].total").value(0));
    }

    private long shift(long departmentId, String date, String manager) throws Exception {
        String body = """
                {"departmentId":%d,"date":"%s","startTime":"07:00","endTime":"11:00","wage":120000,"maxStaff":5,
                 "allowCrossDepartment":true}""".formatted(departmentId, date);
        return json.readTree(call(POST, "/api/v1/shifts", manager, body).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString()).get("id").asLong();
    }

    private void assign(long shiftId, long staffId, String status) {
        flush();
        jdbc.sql("INSERT INTO shift_assignment (shift_id, staff_id, status) VALUES (?, ?, ?)")
                .params(shiftId, staffId, status).update();
    }
}
