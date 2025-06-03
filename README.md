# New Who - UK Air Date Order Addon for Stremio

Welcome to the **New Who** Stremio addon! This addon provides a comprehensive viewing order for "Doctor Who" (2005-Present) based on **original UK broadcast/release dates**, allowing you to experience the modern era of the Doctor's adventures as they originally unfolded.

## Features

*   **Original UK Air Date Order:** Experience the full journey of the modern Doctors, from the Ninth Doctor to the Fifteenth, and beyond. All episodes are sorted primarily by their original UK air/release date.
*   **All Narrative Content Included:**
    *   **Main Show Episodes:** All regular season episodes.
    *   **Specials:** Christmas, New Year, Anniversary, and other standalone full-length special episodes.
    *   **Minisodes:** Short, story-relevant mini-episodes.
    *   **Prequels:** Short episodes released to directly lead into an upcoming main episode or special.
*   **Single Series Entry:** The entire New Who saga is presented as one continuous series within Stremio for easy browsing.
*   **Clear Titling:** Minisodes, Prequels, and Specials are clearly identified in their titles.

## Why This Order?

Doctor Who often releases supplemental content that enriches the main storyline. This addon presents all episodes, specials, minisodes, and prequels in the sequence of their original UK release, allowing viewers to follow the series as it was broadcast. This method ensures that prequels and minisodes are generally viewed in a contextually relevant place relative to the main series episodes they accompany.

## Viewing Order Logic

The order is meticulously curated and presented based on:

1.  **Original UK Release Dates (`released` field):** Episodes are primarily sorted by their initial air/release date in the UK.
2.  **Season & Episode Numbers (`season`, `episode` fields):** Used as a secondary sort key to maintain correct order for items released on the same day or where release date alone isn't sufficient for precise sequencing within a broadcast block.
3.  **Integration of Supplemental Content:** Minisodes and prequels are slotted in according to their release relative to main episodes and specials.
