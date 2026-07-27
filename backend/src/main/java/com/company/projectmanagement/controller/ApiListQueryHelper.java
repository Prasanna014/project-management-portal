package com.company.projectmanagement.controller;

import org.springframework.beans.BeanWrapperImpl;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

public final class ApiListQueryHelper {

    private ApiListQueryHelper() {
    }

    public static <T> Map<String, Object> filterSortPaginate(
            List<T> source,
            String keyword,
            Boolean active,
            String sortBy,
            String sortDir,
            int page,
            int size,
            Function<T, String> keywordExtractor,
            Function<T, Boolean> activeExtractor
    ) {
        List<T> filtered = new ArrayList<>(source);

        if (keyword != null && !keyword.isBlank() && keywordExtractor != null) {
            String normalized = keyword.trim().toLowerCase();
            filtered = filtered.stream()
                    .filter(item -> {
                        String hay = keywordExtractor.apply(item);
                        return hay != null && hay.toLowerCase().contains(normalized);
                    })
                    .toList();
        }

        if (active != null && activeExtractor != null) {
            filtered = filtered.stream()
                    .filter(item -> Objects.equals(activeExtractor.apply(item), active))
                    .toList();
        }

        Comparator<T> comparator = Comparator.comparing(
                item -> {
                    Object value = readProperty(item, sortBy);
                    if (value == null) {
                        return "";
                    }
                    if (value instanceof Comparable<?>) {
                        return value;
                    }
                    return value.toString();
                },
                (left, right) -> {
                    if (left == right) {
                        return 0;
                    }
                    if (left == null) {
                        return -1;
                    }
                    if (right == null) {
                        return 1;
                    }
                    if (left instanceof Comparable<?> && right instanceof Comparable<?>) {
                        @SuppressWarnings("unchecked")
                        Comparable<Object> cl = (Comparable<Object>) left;
                        return cl.compareTo(right);
                    }
                    return left.toString().compareToIgnoreCase(right.toString());
                }
        );

        if ("desc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }

        filtered = filtered.stream().sorted(comparator).toList();

        int totalElements = filtered.size();
        int totalPages = size == 0 ? 1 : (int) Math.ceil((double) totalElements / (double) size);
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<T> content = filtered.subList(fromIndex, toIndex);

        return Map.of(
                "content", content,
                "page", page,
                "size", size,
                "totalElements", totalElements,
                "totalPages", totalPages,
                "sortBy", sortBy,
                "sortDir", sortDir == null ? "asc" : sortDir.toLowerCase()
        );
    }

    private static Object readProperty(Object item, String propertyName) {
        if (item == null || propertyName == null || propertyName.isBlank()) {
            return null;
        }
        try {
            BeanWrapperImpl wrapper = new BeanWrapperImpl(item);
            return wrapper.getPropertyValue(propertyName);
        } catch (Exception ex) {
            return null;
        }
    }
}
