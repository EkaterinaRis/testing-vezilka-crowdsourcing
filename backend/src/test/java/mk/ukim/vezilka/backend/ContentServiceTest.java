package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.model.exceptions.ContentNotFoundException;
import mk.ukim.vezilka.backend.repository.ContentRepository;
import mk.ukim.vezilka.backend.service.FileManagementService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContentServiceTest {

    @Mock
    private ContentRepository contentRepository;

    @Mock
    private FileManagementService fileManagementService;

    @InjectMocks
    private ContentServiceImpl contentService;

    @Test
    void getPublicContentsReturnsPage() {
        Page<Content> expectedPage = new PageImpl<>(List.of(new Content()));
        when(contentRepository.getAllByIsPrivateIsFalse(anyString(), any(PageRequest.class))).thenReturn(expectedPage);

        Page<Content> result = contentService.getPublicContents("test", 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(contentRepository).getAllByIsPrivateIsFalse("test", PageRequest.of(0, 10));
    }

    @Test
    void getPublicContentAsFileSuccess() {
        Content content = new Content();
        content.setPrivate(false);
        content.setFileUrl("file.txt");
        Resource mockResource = mock(Resource.class);

        when(contentRepository.getContentById(1L)).thenReturn(Optional.of(content));
        when(fileManagementService.loadFileAsResource("file.txt")).thenReturn(mockResource);

        Resource result = contentService.getPublicContentAsFile(1L);

        assertNotNull(result);
        assertEquals(mockResource, result);
    }

    @Test
    void getPublicContentAsFileThrowsExceptionWhenNotFound() {
        when(contentRepository.getContentById(1L)).thenReturn(Optional.empty());

        assertThrows(ContentNotFoundException.class, () -> {
            contentService.getPublicContentAsFile(1L);
        });
    }

    @Test
    void getPublicContentAsFileThrowsExceptionWhenContentIsPrivate() {
        Content content = new Content();
        content.setPrivate(true);
        content.setFileUrl("file.txt");

        when(contentRepository.getContentById(1L)).thenReturn(Optional.of(content));

        assertThrows(ContentNotFoundException.class, () -> {
            contentService.getPublicContentAsFile(1L);
        });
        verify(fileManagementService, never()).loadFileAsResource(anyString());
    }

    @Test
    void getContentByIdReturnsContent() {
        Content content = new Content();
        when(contentRepository.getContentById(1L)).thenReturn(Optional.of(content));

        Content result = contentService.getContentById(1L);

        assertNotNull(result);
        assertEquals(content, result);
    }

    @Test
    void getContentByIdReturnsNullWhenNotFound() {
        when(contentRepository.getContentById(1L)).thenReturn(Optional.empty());

        Content result = contentService.getContentById(1L);

        assertNull(result);
    }
}