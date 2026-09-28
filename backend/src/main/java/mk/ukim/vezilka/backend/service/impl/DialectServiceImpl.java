package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.Dialect;
import mk.ukim.vezilka.backend.repository.DialectRepository;
import mk.ukim.vezilka.backend.service.DialectService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DialectServiceImpl implements DialectService {
    private final DialectRepository dialectRepository;

    public DialectServiceImpl(DialectRepository dialectRepository) {
        this.dialectRepository = dialectRepository;
    }

    @Override
    public List<Dialect> getAllDialects() {
        return dialectRepository.findAll();
    }

    @Override
    public Dialect getDialectById(Long id) {
        return dialectRepository.findById(id).orElse(null);
    }
}
