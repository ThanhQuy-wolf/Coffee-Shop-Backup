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
import org.springframework.web.bind.annotation.RestController;

import vn.drinkool.catalog.CatalogDtos.AvailabilityRequest;
import vn.drinkool.catalog.CatalogDtos.ComboDto;
import vn.drinkool.catalog.CatalogDtos.ComboInput;

@RestController
@RequestMapping("/api/v1/combos")
public class ComboController {

    private final ComboService service;

    public ComboController(ComboService service) {
        this.service = service;
    }

    @GetMapping
    public List<ComboDto> list() {
        return service.list();
    }

    @PostMapping
    public ResponseEntity<ComboDto> create(@Valid @RequestBody ComboInput in) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(in));
    }

    @PutMapping("/{id}")
    public ComboDto update(@PathVariable long id, @Valid @RequestBody ComboInput in) {
        return service.update(id, in);
    }

    @PatchMapping("/{id}/availability")
    public ComboDto setAvailability(@PathVariable long id, @Valid @RequestBody AvailabilityRequest req) {
        return service.setAvailability(id, req.isAvailable());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
