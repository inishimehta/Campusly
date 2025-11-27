package ca.gbc.comp3074.campusly.data
import ca.gbc.comp3074.campusly.PlaceEntity
import ca.gbc.comp3074.campusly.R
import java.lang.annotation.ElementType
import java.time.LocalDateTime

//private val Unit.student_centre: Int
private const val PACKAGE = "ca.gbc.comp3074.campusly"

private fun resUri(resId: Int): String =
    "android.resource://$PACKAGE/$resId"

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
        PlaceEntity(
            id = 0L,
            name = "Student Library",
            campus = "Casa Loma, toronto, canada",
            description = "Quiet study space with computers, printers, and bookable rooms.",
            rating = 4.8,
            tags = listOf("Study", "Quiet", "Computers"),
            isFeatured = true,
            imageUri = resUri(R.drawable.central_library)
        ),

        PlaceEntity(
            id = 0L,
            name = "Student Hub",
            campus = "St James, toronto, canada",
            description = "Lounge area, study tables, coffee machines, and group work areas.",
            rating = 4.5,
            tags = listOf("Study", "Group Work", "Social"),
            isFeatured = false,
            imageUri = resUri(R.drawable.student_centre)
        ),

        PlaceEntity(
            id = 0L,
            name = "Cafeteria",
            campus = "Casa Loma, toronto, canada",
            description = "Large cafeteria with food, drinks, and plenty of seating.",
            rating = 4.1,
            tags = listOf("Food", "Social"),
            isFeatured = false,
            imageUri = resUri(R.drawable.campus_cafe)
        )
    )

    val Event = listOf(
        Event(1,"Orientation Week Meetup","Main Hall","2025-10-06 10:00 AM","Welcome new students to campus life" ),
        Event(2,"Career Fair","Building C - Auditorium","2025-10-08 09:00 AM","Meet top employers and explore job opportunities."),
        Event(3,"Yoga in the Park","Campus Green","2025-10-05 04:00 PM","Relax and unwind with a guided yoga session.")
    )
}
