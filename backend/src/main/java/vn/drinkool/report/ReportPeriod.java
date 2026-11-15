package vn.drinkool.report;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

import vn.drinkool.common.error.ApiException;

/**
 * Một kỳ báo cáo theo giờ quán và các mốc của biểu đồ RP-2.
 * Ngày chia theo giờ, tuần và tháng chia theo ngày, năm chia theo tháng (R-55).
 */
record ReportPeriod(Kind kind, LocalDateTime from, LocalDateTime to) {

    enum Kind {
        DAY(ChronoUnit.HOURS, "hour", "HH:00"),
        WEEK(ChronoUnit.DAYS, "day", "dd/MM"),
        MONTH(ChronoUnit.DAYS, "day", "dd/MM"),
        YEAR(ChronoUnit.MONTHS, "month", "'T'M");

        final ChronoUnit step;
        final String sqlUnit;
        final DateTimeFormatter label;

        Kind(ChronoUnit step, String sqlUnit, String label) {
            this.step = step;
            this.sqlUnit = sqlUnit;
            this.label = DateTimeFormatter.ofPattern(label);
        }
    }

    static ReportPeriod of(String period, LocalDate date) {
        Kind kind;
        try {
            kind = Kind.valueOf((period == null || period.isBlank() ? "month" : period.strip()).toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.validation("period nhận day, week, month, year");
        }
        LocalDate start = switch (kind) {
            case DAY -> date;
            case WEEK -> date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case MONTH -> date.withDayOfMonth(1);
            case YEAR -> date.withDayOfYear(1);
        };
        LocalDate end = switch (kind) {
            case DAY -> start.plusDays(1);
            case WEEK -> start.plusWeeks(1);
            case MONTH -> start.plusMonths(1);
            case YEAR -> start.plusYears(1);
        };
        return new ReportPeriod(kind, start.atStartOfDay(), end.atStartOfDay());
    }

    /** BR-53: kỳ liền trước có cùng loại (tháng trước, năm trước...). */
    ReportPeriod previous() {
        LocalDateTime start = switch (kind) {
            case DAY -> from.minusDays(1);
            case WEEK -> from.minusWeeks(1);
            case MONTH -> from.minusMonths(1);
            case YEAR -> from.minusYears(1);
        };
        return new ReportPeriod(kind, start, from);
    }

    List<LocalDateTime> buckets() {
        List<LocalDateTime> list = new ArrayList<>();
        for (LocalDateTime t = from; t.isBefore(to); t = t.plus(1, kind.step)) {
            list.add(t);
        }
        return list;
    }

    String label(LocalDateTime bucket) {
        return bucket.format(kind.label);
    }
}
