package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.model.exceptions.ContentNotFoundException;
import mk.ukim.vezilka.backend.repository.ContentRepository;
import mk.ukim.vezilka.backend.service.ContentService;
import mk.ukim.vezilka.backend.service.FileManagementService;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContentServiceImpl implements ContentService {
    private ContentRepository contentRepository;
    private FileManagementService fileManagementService;

    public ContentServiceImpl(ContentRepository contentRepository, FileManagementService fileManagementService) {
        this.contentRepository = contentRepository;
        this.fileManagementService = fileManagementService;
    }

    @Override
    public Page<Content> getPublicContents(String search, int pageNumber, int pageSize) {
        return contentRepository.getAllByIsPrivateIsFalse(search, PageRequest.of(pageNumber, pageSize));
    }

    @Override
    public Resource getPublicContentAsFile(Long id) {
        Content content = contentRepository.getContentById(id).orElseThrow(() -> new ContentNotFoundException(id));
        if(content.isPrivate()){
            throw new ContentNotFoundException(id);
        }
        return fileManagementService.loadFileAsResource(content.getFileUrl());
    }

    @Override
    public Content getContentById(Long id) {
        return contentRepository.getContentById(id).orElse(null);
    }
}
