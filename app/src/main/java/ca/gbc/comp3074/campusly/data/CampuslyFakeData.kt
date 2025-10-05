package ca.gbc.comp3074.campusly.data
import ca.gbc.comp3074.campusly.R
import java.time.LocalDateTime

//private val Unit.student_centre: Int

data class Place(
    val id: Long,
    val name: String,
    val tags: String,
    val rating: Int,
    val imageResId: Int
)

data class Event(
    val id: Long,
    val name: String,
    val location: String,
    val dateTime: String,
    val description: String,
    val rsvp: Boolean = false
)

object CampuslyFakeData {
    val places = listOf(
        Place(1, "Student Centre", "lounges, clubs, helpdesk", 5, R.drawable.student_centre),
        Place(2, "Central Library", "study, quiet, printing", 5, R.drawable.central_library),
        Place(3, "Campus Café", "coffee, snacks, chill", 4, R.drawable.campus_cafe)
    )

    val Event = listOf(
        Event(1,"Orientation Week Meetup","Main Hall","2025-10-06 10:00 AM","Welcome new students to campus life" ),
        Event(2,"Career Fair","Building C - Auditorium","2025-10-08 09:00 AM","Meet top employers and explore job opportunities."),
        Event(3,"Yoga in the Park","Campus Green","2025-10-05 04:00 PM","Relax and unwind with a guided yoga session.")
    )
}
