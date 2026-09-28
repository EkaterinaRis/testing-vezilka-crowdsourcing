package mk.ukim.vezilka.backend.service;

import mk.ukim.vezilka.backend.model.Transcription;

public interface TranscriptionService {
    Transcription saveTranscription(Transcription transcription);
    Transcription getTranscriptionFromContentId(Long contentId);
    Transcription editTranscriptionOfContent(Long contentId, String text);
}
