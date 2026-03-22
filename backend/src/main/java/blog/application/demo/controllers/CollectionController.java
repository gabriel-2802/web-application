package blog.application.demo.controllers;

import blog.application.demo.services.CollectionService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/collections")
@AllArgsConstructor
public class CollectionController {
    private final CollectionService collectionService;
}
