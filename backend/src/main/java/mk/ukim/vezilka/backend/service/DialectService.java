package mk.ukim.vezilka.backend.service;

import mk.ukim.vezilka.backend.model.Dialect;

import java.util.List;

public interface DialectService {
    List<Dialect> getAllDialects();

    Dialect getDialectById(Long id);
}
