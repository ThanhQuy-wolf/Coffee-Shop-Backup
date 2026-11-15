package vn.drinkool.report;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.drinkool.report.ReportDtos.LaborCost;
import vn.drinkool.report.ReportDtos.ProductSales;
import vn.drinkool.report.ReportDtos.RevenueReport;
import vn.drinkool.report.ReportDtos.Summary;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reports;

    ReportController(ReportService reports) {
        this.reports = reports;
    }

    /** RP-1 */
    @GetMapping("/summary")
    public Summary summary(@RequestParam(required = false) String period,
                           @RequestParam(required = false) String date) {
        return reports.summary(period, date);
    }

    /** RP-2 */
    @GetMapping("/revenue")
    public RevenueReport revenue(@RequestParam(required = false) String period,
                                 @RequestParam(required = false) String date) {
        return reports.revenue(period, date);
    }

    /** RP-3 */
    @GetMapping("/product-sales")
    public List<ProductSales> productSales(@RequestParam(required = false) String period,
                                           @RequestParam(required = false) String date,
                                           @RequestParam(required = false) Long categoryId) {
        return reports.productSales(period, date, categoryId);
    }

    /** RP-4 */
    @GetMapping("/labor-cost")
    public LaborCost laborCost(@RequestParam(required = false) String weekStart) {
        return reports.laborCost(weekStart);
    }
}
