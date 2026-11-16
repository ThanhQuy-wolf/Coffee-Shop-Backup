package vn.drinkool.shift;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;

class ShiftApiTest extends ShiftTestSupport {

    @Test
    void departmentsAndStaff() throws Exception {
        call(GET, "/api/v1/departments", an(), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].code").isNotEmpty());
        call(GET, "/api/v1/staff", managerToken(), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].role").value("MANAGER"))
                .andExpect(jsonPath("$[1].fullName").value("Nguyễn Văn An"))
                .andExpect(jsonPath("$[1].departmentId").value(1));
        call(GET, "/api/v1/staff", an(), null).andExpect(status().isForbidden());
    }

    @Test
    void createValidatesBr40Br41() throws Exception {
        String manager = managerToken();
        String date = today().plusDays(2).toString();
        call(POST, "/api/v1/shifts", manager, shiftBody(1, today().plusDays(2), "07:00", "11:00", 3, false))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.date").value(date))
                .andExpect(jsonPath("$.startTime").value("07:00"))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.occupied").value(0))
                .andExpect(jsonPath("$.remaining").value(3));
        call(POST, "/api/v1/shifts", manager, shiftBody(1, today(), "11:00", "11:00", 3, false))
                .andExpect(status().isUnprocessableContent()).andExpect(jsonPath("$.rule").value("BR-40"));
        call(POST, "/api/v1/shifts", manager, shiftBody(1, today(), "07:00", "11:00", 21, false))
                .andExpect(status().isUnprocessableContent()).andExpect(jsonPath("$.rule").value("BR-41"));
        call(POST, "/api/v1/shifts", manager,
                shiftBody(1, today(), "07:00", "11:00", 3, false).replace("120000", "0"))
                .andExpect(jsonPath("$.rule").value("BR-41"));
        call(POST, "/api/v1/shifts", manager, shiftBody(99, today(), "07:00", "11:00", 3, false))
                .andExpect(status().isUnprocessableContent()).andExpect(jsonPath("$.code").value("VALIDATION"));
        call(POST, "/api/v1/shifts", manager, shiftBody(1, today(), "7h", "11:00", 3, false))
                .andExpect(status().isBadRequest());
        call(POST, "/api/v1/shifts", an(), shiftBody(1, today(), "07:00", "11:00", 3, false))
                .andExpect(status().isForbidden());
    }

    @Test
    void calendarFiltersByRangeAndDepartment() throws Exception {
        futureShift("13:00", "17:00", 2);
        futureShift("07:00", "11:00", 2);
        createShift(shiftBody(2, today().plusDays(2), "07:00", "11:00", 2, false));
        createShift(shiftBody(1, today().plusDays(9), "07:00", "11:00", 2, false));
        String from = today().plusDays(1).toString();
        String to = today().plusDays(3).toString();
        call(GET, "/api/v1/shifts?from=" + from + "&to=" + to, an(), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
        call(GET, "/api/v1/shifts?from=" + from + "&to=" + to + "&departmentId=1", an(), null)
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].startTime").value("07:00"));
        call(GET, "/api/v1/shifts?to=" + to, an(), null).andExpect(status().isBadRequest());
        call(GET, "/api/v1/shifts?from=" + to + "&to=" + from, an(), null).andExpect(status().isBadRequest());
    }

    @Test
    void updateKeepsPeopleInTheShiftConsistent() throws Exception {
        String manager = managerToken();
        String an = an();
        JsonNode morning = futureShift("07:00", "11:00", 2);
        JsonNode afternoon = futureShift("13:00", "17:00", 2);
        call(POST, "/api/v1/shifts/" + morning.get("id").asLong() + "/registrations", an, null)
                .andExpect(status().isOk());
        call(POST, "/api/v1/shifts/" + afternoon.get("id").asLong() + "/registrations", an, null)
                .andExpect(status().isOk());
        String path = "/api/v1/shifts/" + afternoon.get("id").asLong();
        String date = today().plusDays(2).toString();
        String body = """
                {"departmentId":1,"date":"%s","startTime":"%s","endTime":"%s","wage":150000,"maxStaff":%d,
                 "allowCrossDepartment":false,"version":%d}""";

        call(PUT, path, manager, body.formatted(date, "13:00", "17:00", 2, 9))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.rule").value("BR-27"))
                .andExpect(jsonPath("$.currentVersion").value(1));
        call(PUT, path, manager, body.formatted(date, "13:00", "17:00", 0, 1))
                .andExpect(jsonPath("$.rule").value("BR-41"));
        call(PUT, path, manager, body.formatted(date, "10:00", "14:00", 2, 1))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-42"));
        // Nối tiếp ca sáng (11:00) không tính là trùng (BR-45)
        call(PUT, path, manager, body.formatted(date, "11:00", "15:00", 2, 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startTime").value("11:00"))
                .andExpect(jsonPath("$.wage").value(150000))
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.occupied").value(1));
        call(PUT, path, manager, "{\"departmentId\":1}").andExpect(status().isBadRequest());
    }

    @Test
    void cancelNotifiesEveryoneInTheShift() throws Exception {
        String manager = managerToken();
        String an = an();
        JsonNode shift = futureShift("07:00", "11:00", 2);
        String path = "/api/v1/shifts/" + shift.get("id").asLong();
        call(POST, path + "/registrations", an, null).andExpect(status().isOk());

        call(POST, path + "/cancel", manager, "{\"reason\":\"Mất điện\",\"version\":1}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.occupied").value(0))
                .andExpect(jsonPath("$.assignments.length()").value(0))
                .andExpect(jsonPath("$.version").value(2));
        JsonNode notes = notifications(an);
        assertThat(notes.get(0).get("type").asString()).isEqualTo("SHIFT_CANCELLED");
        assertThat(notes.get(0).get("message").asString()).contains("Lý do: Mất điện");

        call(POST, path + "/cancel", manager, "{\"reason\":\"x\",\"version\":2}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("SHIFT_STATE"));
        JsonNode started = pastShiftWith(2, 0, "REGISTERED");
        call(POST, "/api/v1/shifts/" + started.get("id").asLong() + "/cancel", manager,
                "{\"reason\":\"x\",\"version\":1}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-42"));
    }
}
