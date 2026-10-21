
package com.bizmate.bizmate_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BusinessRequest(
    @NotBlank(message = "Business idea is required")
    @Size(max = 2000)
    String businessIdea,

    @NotBlank(message = "Location is required")
    @Size(max = 150)
    String location,

    @NotBlank(message = "Budget is required")
    @Size(max = 100)
    String budget,

    @Size(max = 300)
    String targetAudience
) {}
