package mk.ukim.vezilka.backend.web.controller;

import mk.ukim.vezilka.backend.model.Dialect;
import mk.ukim.vezilka.backend.service.DialectService;
import mk.ukim.vezilka.backend.web.response.DialectResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/dialect")
public class DialectController {
    private final DialectService dialectService;

    public DialectController(DialectService dialectService) {
        this.dialectService = dialectService;
    }

    @GetMapping
    private ResponseEntity<List<DialectResponse>> getAllDialects() {
        List<Dialect> dialects = dialectService.getAllDialects();
        List<DialectResponse> responses = dialects.stream().map(DialectResponse::new).toList();
        return ResponseEntity.ok(responses);
    }
}
