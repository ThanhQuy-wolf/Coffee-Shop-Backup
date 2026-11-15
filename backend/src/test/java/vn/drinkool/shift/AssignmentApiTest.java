package vn.drinkool.shift;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import tools.jackson.databind.JsonNode;

class AssignmentApiTest extends ShiftTestSupport {

    @Autowired
    private LeaveExpiryJob leaveExpiry;

    private static String reg(JsonNode shift) {
        return "/api/v1/shifts/" + shift.get("id").asLong() + "/registrations";
    }

    private static String asg(long id) {
        return "/api/v1/shift-assignments/" + id;
    }

    @Test
    void registerChecksRulesInOrder() throws Exception {
        String an = an();
        String binh = binh();
        JsonNode morning = futureShift("07:00", "11:00", 1);
        call(POST, reg(morning), an, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.occupied").value(1))
                .andExpect(jsonPath("$.remaining").value(0))
                .andExpect(jsonPath("$.assignments[0].staffName").value("Nguyễn Văn An"))
                .andExpect(jsonPath("$.assignments[0].status").value("REGISTERED"));
        call(POST, reg(morning), an, null)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.rule").value("BR-44"));
        // Bình thuộc bộ phận 3: ca bộ phận 1 không cho làm chéo thì nhận BR-46 trước BR-43
        call(POST, reg(morning), binh, null)
                .andExpect(status().isUnprocessableContent()).andExpect(jsonPath("$.rule").value("BR-46"));
        JsonNode cross = createShift(shiftBody(1, today().plusDays(2), "07:00", "11:00", 1, true));
        call(POST, reg(cross), managerToken(), null).andExpect(status().isOk());
        call(POST, reg(cross), binh, null)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.rule").value("BR-43"));

        JsonNode overlapping = futureShift("10:00", "14:00", 3);
        call(POST, reg(overlapping), an, null)
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-45"))
                .andExpect(jsonPath("$.title").value(org.hamcrest.Matchers.containsString("07:00–11:00")));
        call(POST, reg(futureShift("11:00", "15:00", 3)), an, null).andExpect(status().isOk());

        JsonNode farAway = createShift(shiftBody(1, today().plusDays(15), "07:00", "11:00", 3, false));
        call(POST, reg(farAway), an, null).andExpect(jsonPath("$.rule").value("BR-46"));
        JsonNode started = pastShiftWith(3, 0, "REGISTERED");
        call(POST, reg(started), an, null).andExpect(jsonPath("$.rule").value("BR-46"));
        call(POST, "/api/v1/shifts/999999/registrations", an, null).andExpect(status().isNotFound());
    }

    @Test
    void unregisterOnlyUntilP10HoursBefore() throws Exception {
        String an = an();
        JsonNode shift = futureShift("07:00", "11:00", 2);
        call(DELETE, reg(shift) + "/me", an, null).andExpect(status().isNotFound());
        call(POST, reg(shift), an, null).andExpect(status().isOk());
        call(DELETE, reg(shift) + "/me", an, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.occupied").value(0))
                .andExpect(jsonPath("$.assignments.length()").value(0));

        JsonNode soon = shiftStartingIn(180);
        call(POST, reg(soon), an, null).andExpect(status().isOk());
        call(DELETE, reg(soon) + "/me", an, null)
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-47"));
    }

    @Test
    void leaveRequestAndDecision() throws Exception {
        String an = an();
        String manager = managerToken();
        JsonNode shift = futureShift("07:00", "11:00", 2);
        long id = assignmentId(json.readTree(call(POST, reg(shift), an, null)
                .andReturn().getResponse().getContentAsString()), 0);

        call(POST, asg(id) + "/leave-request", binh(), "{\"reason\":\"Ốm\"}").andExpect(status().isForbidden());
        call(POST, asg(id) + "/leave-request", an, "{\"reason\":\"  \"}")
                .andExpect(status().isUnprocessableContent()).andExpect(jsonPath("$.rule").value("BR-48"));
        call(POST, asg(id) + "/leave-request", an, "{\"reason\":\"Thi cuối kỳ\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignments[0].status").value("LEAVE_REQUESTED"))
                .andExpect(jsonPath("$.assignments[0].leaveReason").value("Thi cuối kỳ"))
                .andExpect(jsonPath("$.occupied").value(1));
        call(POST, asg(id) + "/leave-request", an, "{\"reason\":\"Lần hai\"}")
                .andExpect(jsonPath("$.rule").value("BR-48"));
        call(POST, asg(id) + "/leave-decision", an, "{\"approve\":true}").andExpect(status().isForbidden());
        call(POST, asg(id) + "/leave-decision", manager, "{\"approve\":true}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignments[0].status").value("LEAVE_APPROVED"))
                .andExpect(jsonPath("$.occupied").value(0));
        call(POST, asg(id) + "/leave-decision", manager, "{\"approve\":false}")
                .andExpect(jsonPath("$.rule").value("BR-48"));
        assertThat(notifications(an).get(0).get("type").asString()).isEqualTo("LEAVE_APPROVED");

        // Được nghỉ thì chỗ được trả lại, đăng ký lại được (BR-44 bỏ qua LEAVE_APPROVED)
        long again = assignmentId(json.readTree(call(POST, reg(shift), an, null)
                .andReturn().getResponse().getContentAsString()), 1);
        call(POST, asg(again) + "/leave-request", an, "{\"reason\":\"Ốm\"}").andExpect(status().isOk());
        call(POST, asg(again) + "/leave-decision", manager, "{\"approve\":false}")
                .andExpect(jsonPath("$.assignments[1].status").value("REGISTERED"));
        assertThat(notifications(an).get(0).get("type").asString()).isEqualTo("LEAVE_REJECTED");
    }

    @Test
    void undecidedLeaveExpiresAtShiftStart() throws Exception {
        String an = an();
        JsonNode shift = futureShift("07:00", "11:00", 2);
        long id = assignmentId(json.readTree(call(POST, reg(shift), an, null)
                .andReturn().getResponse().getContentAsString()), 0);
        call(POST, asg(id) + "/leave-request", an, "{\"reason\":\"Ốm\"}").andExpect(status().isOk());
        flush();
        jdbc.sql("UPDATE shift SET shift_date = ?, start_time = '00:00', end_time = '00:01' WHERE id = ?")
                .params(today(), shift.get("id").asLong()).update();
        em.clear();

        // W-10 tự chạy bước của job nên không duyệt được yêu cầu đã hết hạn
        call(POST, asg(id) + "/leave-decision", managerToken(), "{\"approve\":true}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-48"));
        assertThat(leaveExpiry.expire()).isZero();
        JsonNode notes = notifications(an);
        assertThat(notes.get(0).get("type").asString()).isEqualTo("LEAVE_EXPIRED");
        assertThat(notes.size()).isEqualTo(1);
        JsonNode list = get("/api/v1/shifts?from=" + today() + "&to=" + today(), an);
        assertThat(list.get(0).get("assignments").get(0).get("status").asString()).isEqualTo("REGISTERED");
    }

    @Test
    void attendanceWindowAndAudit() throws Exception {
        String manager = managerToken();
        JsonNode today = pastShiftWith(2, 0, "REGISTERED");
        long id = assignmentId(get("/api/v1/shifts?from=" + today() + "&to=" + today(), manager)
                .get(0), 0);
        call(POST, asg(id) + "/attendance", manager, "{\"status\":\"ATTENDED\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignments[0].status").value("ATTENDED"));
        call(POST, asg(id) + "/attendance", manager, "{\"status\":\"ABSENT\"}")
                .andExpect(jsonPath("$.assignments[0].status").value("ABSENT"));
        call(POST, asg(id) + "/attendance", manager, "{\"status\":\"REGISTERED\"}")
                .andExpect(status().isBadRequest());
        call(POST, asg(id) + "/attendance", an(), "{\"status\":\"ATTENDED\"}").andExpect(status().isForbidden());
        flush();
        assertThat(jdbc.sql("SELECT action FROM audit_log WHERE entity_type = 'SHIFT_ASSIGNMENT' AND entity_id = ?")
                .param(id).query(String.class).list())
                .containsExactly("ATTENDANCE_MARKED", "ATTENDANCE_MARKED");
        assertThat(today.get("id").isNull()).isFalse();

        JsonNode old = pastShiftWith(3, 5, "REGISTERED");
        long oldId = jdbc.sql("SELECT id FROM shift_assignment WHERE shift_id = ?")
                .param(old.get("id").asLong()).query(Long.class).single();
        call(POST, asg(oldId) + "/attendance", manager, "{\"status\":\"ATTENDED\"}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-49"));

        JsonNode future = futureShift("07:00", "11:00", 2);
        long futureId = assignmentId(json.readTree(call(POST, reg(future), an(), null)
                .andReturn().getResponse().getContentAsString()), 0);
        call(POST, asg(futureId) + "/attendance", manager, "{\"status\":\"ATTENDED\"}")
                .andExpect(jsonPath("$.rule").value("BR-49"));
    }

    @Test
    void managerRemovesSomeoneFromFutureShift() throws Exception {
        String an = an();
        String manager = managerToken();
        JsonNode shift = futureShift("07:00", "11:00", 2);
        long id = assignmentId(json.readTree(call(POST, reg(shift), an, null)
                .andReturn().getResponse().getContentAsString()), 0);
        call(DELETE, asg(id), an, null).andExpect(status().isForbidden());
        call(DELETE, asg(id), manager, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.occupied").value(0))
                .andExpect(jsonPath("$.assignments.length()").value(0));
        assertThat(notifications(an).get(0).get("type").asString()).isEqualTo("ASSIGNMENT_REMOVED");
        call(DELETE, asg(id), manager, null)
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-42"));
        call(DELETE, asg(999999), manager, null).andExpect(status().isNotFound());
    }

    @Test
    void customersCannotSeeShifts() throws Exception {
        String customer = json.readTree(call(POST, "/api/customer/login", null,
                        "{\"phone\":\"0987654321\",\"password\":\"user1\"}")
                .andReturn().getResponse().getContentAsString()).get("accessToken").asString();
        call(GET, "/api/v1/shifts?from=" + today() + "&to=" + today(), customer, null)
                .andExpect(status().isForbidden());
        call(GET, "/api/v1/departments", null, null).andExpect(status().isUnauthorized());
    }
}
