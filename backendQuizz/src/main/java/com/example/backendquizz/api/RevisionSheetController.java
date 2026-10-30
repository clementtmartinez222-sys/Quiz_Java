package com.example.backendquizz.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sheets")
public class RevisionSheetController {
    private final JdbcTemplate jdbc;
    public RevisionSheetController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping
    public List<SheetResponse> getSheets() {
        List<SheetRow> rows = jdbc.query("SELECT s.id,s.title,s.description,s.category,s.reading_minutes,s.color,s.quiz_slug,n.content " +
                        "FROM revision_sheet s LEFT JOIN revision_notion n ON n.sheet_id=s.id WHERE s.is_active=true ORDER BY s.id,n.position",
                (rs, row) -> new SheetRow(rs.getLong("id"), rs.getString("title"), rs.getString("description"),
                        rs.getString("category"), rs.getInt("reading_minutes"), rs.getString("color"), rs.getString("quiz_slug"), rs.getString("content")));
        Map<Long, SheetBuilder> sheets = new LinkedHashMap<>();
        for (SheetRow row : rows) {
            SheetBuilder sheet = sheets.computeIfAbsent(row.id(), id -> new SheetBuilder(row));
            if (row.content() != null) sheet.notions().add(row.content());
        }
        return sheets.values().stream().map(SheetBuilder::toResponse).toList();
    }

    public record SheetResponse(long id, String quizId, String titre, String description, String categorie, int dureeLecture,
                                int nombreNotions, String couleur, List<String> notions) {}
    private record SheetRow(long id, String title, String description, String category, int minutes, String color, String quizSlug, String content) {}
    private static final class SheetBuilder {
        private final SheetRow row; private final List<String> notions = new ArrayList<>();
        private SheetBuilder(SheetRow row) { this.row = row; }
        private List<String> notions() { return notions; }
        private SheetResponse toResponse() { return new SheetResponse(row.id(), row.quizSlug(), row.title(), row.description(), row.category(),
                row.minutes(), notions.size(), row.color(), notions); }
    }
}
