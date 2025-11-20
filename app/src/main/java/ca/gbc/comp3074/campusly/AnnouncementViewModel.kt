package ca.gbc.comp3074.campusly

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class AnnouncementViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = AppDatabase.getDatabase(application).announcementDao()
    private val prefs = application.getSharedPreferences("announcement_prefs", Context.MODE_PRIVATE)

    val announcements: StateFlow<List<AnnouncementEntity>> =
        dao.getAllAnnouncements()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        seedAnnouncementsOnce()
    }

    private fun seedAnnouncementsOnce() {
        viewModelScope.launch {
            if (prefs.getBoolean("seeded_announcements", false)) return@launch

            val sampleAnnouncements = listOf(
                AnnouncementEntity(
                    title = "GBC Students Win 3rd Place at Toronto ASCM Competition",
                    message = "A team of George Brown College students earned a strong third-place finish at the Toronto ASCM Supply Chain Case Competition.",
                    link = "https://www.georgebrown.ca/news/2025/george-brown-students-secure-third-place-at-the-toronto-ascm-case-competition",
                    isSeeded = true
                ),
                AnnouncementEntity(
                    title = "Future Skilled Trades Leaders Arrive for BOLT Day of Discovery",
                    message = "George Brown College welcomed future skilled trades leaders as part of the BOLT Foundation’s Day of Discovery event.",
                    link = "https://www.georgebrown.ca/news/2025/george-brown-welcomes-future-skilled-trades-leaders-for-bolt-day-of-discovery",
                    isSeeded = true
                ),
                AnnouncementEntity(
                    title = "Leadership & Reconciliation: Dr. Siyabulela Mandela Visits GBC",
                    message = "Dr. Siyabulela Mandela shared powerful lessons on leadership, justice, and reconciliation during his visit to campus.",
                    link = "https://www.georgebrown.ca/news/2025/dr-siyabulela-mandela-brings-lessons-in-leadership-and-reconciliation-to-george-brown",
                    isSeeded = true
                ),
                AnnouncementEntity(
                    title = "Toronto Blockchain Community Launches New Scholarship",
                    message = "George Brown College celebrates the launch of a new Blockchain Community Scholarship supporting students in technology programs.",
                    link = "https://www.georgebrown.ca/news/2025/toronto-blockchain-community-scholarship-launches-at-george-brown-college",
                    isSeeded = true
                ),
                AnnouncementEntity(
                    title = "George Brown Marks Veterans Week",
                    message = "The GBC community reflects on service and sacrifice during Canada’s annual Veterans Week.",
                    link = "https://www.georgebrown.ca/news/2025/marking-veterans-week",
                    isSeeded = true
                ),
                AnnouncementEntity(
                    title = "Polytechnic Students Compete in Annual Gingerbread Challenge",
                    message = "George Brown Polytechnic students showcased creativity and teamwork in the beloved yearly gingerbread competition.",
                    link = "https://www.georgebrown.ca/news/2025/george-brown-polytechnic-students-compete-in-annual-gingerbread-competition",
                    isSeeded = true
                ),
                AnnouncementEntity(
                    title = "Treaties Recognition Week at George Brown College",
                    message = "GBC honours Treaties Recognition Week by promoting education and awareness of Indigenous history and treaty rights.",
                    link = "https://www.georgebrown.ca/news/2025/treaties-recognition-week",
                    isSeeded = true
                )
            )


            sampleAnnouncements.forEach { dao.insertAnnouncement(it) }

            prefs.edit().putBoolean("seeded_announcements", true).apply()
        }
    }

    fun addAnnouncement(title: String, message: String, link: String) {
        if (title.isBlank() && message.isBlank()) return

        viewModelScope.launch {
            dao.insertAnnouncement(
                AnnouncementEntity(
                    title = title.ifBlank { "Untitled Announcement" },
                    message = message,
                    link = link,
                    isSeeded = false
                )
            )
        }
    }

    fun updateAnnouncement(entity: AnnouncementEntity, newTitle: String, newMessage: String, newLink: String) {
        viewModelScope.launch {
            if (entity.isSeeded) return@launch   // don't update seeded ones

            dao.updateAnnouncement(
                entity.copy(
                    title = newTitle.ifBlank { "Untitled Announcement" },
                    message = newMessage,
                    link = newLink
                )
            )
        }
    }

    fun deleteAnnouncement(entity: AnnouncementEntity) {
        if (entity.isSeeded) return  // don't delete seeded items
        viewModelScope.launch {
            dao.deleteAnnouncement(entity)
        }
    }
}
