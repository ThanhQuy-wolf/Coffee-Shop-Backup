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
import org.springframework.web.bind.annotation.RestController;

import vn.drinkool.catalog.CatalogDtos.AvailabilityRequest;
import vn.drinkool.catalog.CatalogDtos.OptionGroupDto;
import vn.drinkool.catalog.CatalogDtos.OptionGroupInput;
import vn.drinkool.catalog.CatalogDtos.OptionValueDto;

@RestController
public class OptionGroupController {

    private final OptionGroupService service;

    public OptionGroupController(OptionGroupService service) {
        this.service = service;
    }

    @GetMapping("/api/v1/option-groups")
    public List<OptionGroupDto> list() {
        return service.list();
    }

    @PostMapping("/api/v1/option-groups")
    public ResponseEntity<OptionGroupDto> create(@Valid @RequestBody OptionGroupInput in) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(in));
    }

    @PutMapping("/api/v1/option-groups/{id}")
    public OptionGroupDto update(@PathVariable long id, @Valid @RequestBody OptionGroupInput in) {
        return service.update(id, in);
    }

    @DeleteMapping("/api/v1/option-groups/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/v1/option-values/{valueId}/availability")
    public OptionValueDto setValueAvailability(@PathVariable long valueId,
                                               @Valid @RequestBody AvailabilityRequest req) {
        return service.setValueAvailability(valueId, req.isAvailable());
    }
}
