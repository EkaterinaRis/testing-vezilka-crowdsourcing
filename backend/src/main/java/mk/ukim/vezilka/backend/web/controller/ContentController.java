package mk.ukim.vezilka.backend.web.controller;
import jakarta.servlet.http.HttpServletRequest;
import mk.ukim.vezilka.backend.service.FileManagementService;
import org.springframework.core.io.Resource;
import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.service.ContentService;
import mk.ukim.vezilka.backend.web.response.ContentResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/content")
public class ContentController {

    private ContentService contentService;
    private FileManagementService fileManagementService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping("public")
    public ResponseEntity<Page<ContentResponse>> getPublicFiles(
            @RequestParam(name = "pageNumber", defaultValue = "0") int pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "12") int pageSize,
            @RequestParam(name = "search", required = false, defaultValue = "") String search) {
        Page<Content> publicContents = contentService.getPublicContents(search, pageNumber, pageSize);
        Page<ContentResponse> result = publicContents.map(ContentResponse::new);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam("id") Long id, HttpServletRequest request) {
        Resource resource = contentService.getPublicContentAsFile(id);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            System.out.println("Не може да се одреди типот на фајлот.");
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
