package vn.drinkool.catalog;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.drinkool.catalog.CatalogDtos.AvailabilityRequest;
import vn.drinkool.catalog.CatalogDtos.ProductDto;
import vn.drinkool.catalog.CatalogDtos.ProductInput;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProductDto> list(@RequestParam(required = false) Long categoryId) {
        return service.list(categoryId);
    }

    @PostMapping
    public ResponseEntity<ProductDto> create(@Valid @RequestBody ProductInput in) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(in));
    }

    @PutMapping("/{id}")
    public ProductDto update(@PathVariable long id, @Valid @RequestBody ProductInput in) {
        return service.update(id, in);
    }

    @PatchMapping("/{id}/availability")
    public ProductDto setAvailability(@PathVariable long id, @Valid @RequestBody AvailabilityRequest req) {
        return service.setAvailability(id, req.isAvailable());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
