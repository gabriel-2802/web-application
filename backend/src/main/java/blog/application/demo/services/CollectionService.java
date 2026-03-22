package blog.application.demo.services;

import blog.application.demo.repositories.PostCollectionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CollectionService {
    private final PostCollectionRepository collectionRepository;
}
