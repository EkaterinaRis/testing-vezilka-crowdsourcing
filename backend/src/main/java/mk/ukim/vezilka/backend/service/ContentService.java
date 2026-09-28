package mk.ukim.vezilka.backend.service;

import mk.ukim.vezilka.backend.model.Content;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ContentService {
    Page<Content> getPublicContents(String search, int pageNumber, int pageSize);
    Resource getPublicContentAsFile(Long id);
    Content getContentById(Long id);
}
