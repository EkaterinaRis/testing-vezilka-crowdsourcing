package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.Transcription;
import mk.ukim.vezilka.backend.repository.TranscriptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TranscriptionServiceTest {

    @Mock
    private TranscriptionRepository transcriptionRepository;

    @InjectMocks
    private TranscriptionServiceImpl transcriptionService;

    @Test
    void saveTranscriptionCallsRepositorySave() {
        Transcription transcription = new Transcription();
        when(transcriptionRepository.save(transcription)).thenReturn(transcription);

        Transcription result = transcriptionService.saveTranscription(transcription);

        assertNotNull(result);
        verify(transcriptionRepository).save(transcription);
    }

    @Test
    void getTranscriptionFromContentIdReturnsTranscription() {
        Transcription transcription = new Transcription();
        when(transcriptionRepository.getByContent_Id(1L)).thenReturn(Optional.of(transcription));

        Transcription result = transcriptionService.getTranscriptionFromContentId(1L);

        assertNotNull(result);
        assertEquals(transcription, result);
    }

    @Test
    void getTranscriptionFromContentIdReturnsNullWhenNotFound() {
        when(transcriptionRepository.getByContent_Id(1L)).thenReturn(Optional.empty());

        Transcription result = transcriptionService.getTranscriptionFromContentId(1L);

        assertNull(result);
    }

    @Test
    void editTranscriptionOfContentUpdatesAndSaves() {
        Transcription transcription = new Transcription();
        when(transcriptionRepository.getByContent_Id(1L)).thenReturn(Optional.of(transcription));
        when(transcriptionRepository.save(any(Transcription.class))).thenReturn(transcription);

        Transcription result = transcriptionService.editTranscriptionOfContent(1L, "new text");

        assertNotNull(result);
        verify(transcriptionRepository).save(transcription);
    }

    @Test
    void editTranscriptionOfContentReturnsNullIfNotFound() {
        when(transcriptionRepository.getByContent_Id(1L)).thenReturn(Optional.empty());

        Transcription result = transcriptionService.editTranscriptionOfContent(1L, "new text");

        assertNull(result);
        verify(transcriptionRepository, never()).save(any(Transcription.class));
    }
}