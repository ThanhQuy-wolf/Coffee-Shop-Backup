package vn.drinkool.shift;

import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.simple.JdbcClient;

import tools.jackson.databind.JsonNode;

import vn.drinkool.IntegrationTest;
import vn.drinkool.common.config.ClockConfig;

/** Ca được tạo theo ngày thật của máy chạy test, vì các rule đo khoảng cách tới giờ bắt đầu ca. */
abstract class ShiftTestSupport extends IntegrationTest {

    static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    @Autowired
    protected JdbcClient jdbc;

    static LocalDate today() {
        return LocalDate.now(ClockConfig.SHOP_ZONE);
    }

    static String shiftBody(long departmentId, LocalDate date, String start, String end, int maxStaff,
                            boolean cross) {
        return """
                {"departmentId":%d,"date":"%s","startTime":"%s","endTime":"%s","wage":120000,"maxStaff":%d,
                 "allowCrossDepartment":%s}""".formatted(departmentId, date, start, end, maxStaff, cross);
    }

    protected JsonNode createShift(String body) throws Exception {
        return json.readTree(call(POST, "/api/v1/shifts", managerToken(), body)
                .andReturn().getResponse().getContentAsString());
    }

    /** Ca của bộ phận 1 (bộ phận của nhân viên "an") vào ngày kia. */
    protected JsonNode futureShift(String start, String end, int maxStaff) throws Exception {
        return createShift(shiftBody(1, today().plusDays(2), start, end, maxStaff, false));
    }

    /** Ca bắt đầu sau {@code minutes} phút nữa, dài 1 phút, để thử các mốc giờ sát ca. */
    protected JsonNode shiftStartingIn(long minutes) throws Exception {
        LocalDateTime start = LocalDateTime.now(ClockConfig.SHOP_ZONE).plusMinutes(minutes).withSecond(0).withNano(0);
        if (start.toLocalTime().isAfter(LocalTime.of(23, 57))) {
            start = start.toLocalDate().plusDays(1).atTime(0, 1);
        }
        return createShift(shiftBody(1, start.toLocalDate(), start.toLocalTime().format(HH_MM),
                start.toLocalTime().plusMinutes(1).format(HH_MM), 3, false));
    }

    /** Ca đã bắt đầu từ {@code daysAgo} ngày trước. Phân ca chèn thẳng vì W-7 chặn ca đã bắt đầu. */
    protected JsonNode pastShiftWith(long staffId, int daysAgo, String status) throws Exception {
        JsonNode shift = createShift(shiftBody(1, today().minusDays(daysAgo), "00:00", "00:01", 3, false));
        jdbc.sql("INSERT INTO shift_assignment (shift_id, staff_id, status) VALUES (?, ?, ?)")
                .params(shift.get("id").asLong(), staffId, status).update();
        return shift;
    }

    protected String an() throws Exception {
        return staffToken("an", "123456");
    }

    protected String binh() throws Exception {
        return staffToken("binh", "123456");
    }

    protected long assignmentId(JsonNode shift, int index) {
        return shift.get("assignments").get(index).get("id").asLong();
    }

    protected JsonNode get(String path, String token) throws Exception {
        return json.readTree(call(GET, path, token, null).andReturn().getResponse().getContentAsString());
    }

    protected JsonNode notifications(String token) throws Exception {
        return get("/api/v1/me/notifications", token);
    }
}
