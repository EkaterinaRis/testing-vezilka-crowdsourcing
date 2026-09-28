package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.Dialect;
import mk.ukim.vezilka.backend.repository.DialectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DialectServiceTest {

    @Mock
    private DialectRepository dialectRepository;

    @InjectMocks
    private DialectServiceImpl dialectService;

    @Test
    void getAllDialectsReturnsList() {
        Dialect dialect = new Dialect();
        when(dialectRepository.findAll()).thenReturn(List.of(dialect));

        List<Dialect> result = dialectService.getAllDialects();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(dialectRepository).findAll();
    }

    @Test
    void getDialectByIdReturnsDialect() {
        Dialect dialect = new Dialect();
        when(dialectRepository.findById(1L)).thenReturn(Optional.of(dialect));

        Dialect result = dialectService.getDialectById(1L);

        assertNotNull(result);
        assertEquals(dialect, result);
    }

    @Test
    void getDialectByIdReturnsNullWhenNotFound() {
        when(dialectRepository.findById(1L)).thenReturn(Optional.empty());

        Dialect result = dialectService.getDialectById(1L);

        assertNull(result);
    }
}