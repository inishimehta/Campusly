package ca.gbc.comp3074.campusly.data
import ca.gbc.comp3074.campusly.R
//private val Unit.student_centre: Int

data class Place(
    val id: Long,
    val name: String,
    val tags: String,
    val rating: Int,
    val imageResId: Int
)

object CampuslyFakeData {
    val places = listOf(
        Place(1, "Student Centre", "lounges, clubs, helpdesk", 5, R.drawable.student_centre),
        Place(2, "Central Library", "study, quiet, printing", 5, R.drawable.central_library),
        Place(3, "Campus Café", "coffee, snacks, chill", 4, R.drawable.campus_cafe)
    )
}
