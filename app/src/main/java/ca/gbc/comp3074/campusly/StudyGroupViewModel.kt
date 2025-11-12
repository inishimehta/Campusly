package ca.gbc.comp3074.campusly

import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class StudyGroupViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = AppDatabase.getDatabase(application).studyGroupDao()

    private val prefs: SharedPreferences =
        application.getSharedPreferences("joined_groups_prefs", Context.MODE_PRIVATE)

    // All groups from Room mapped to UI model
    val allGroups: StateFlow<List<StudyGroup>> = dao.getAllGroups()
        .map { list -> list.map { StudyGroup(it.id, it.name, it.description) } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Joined groups as a StateFlow so UI updates synchronously
    private val _joinedGroups = MutableStateFlow(loadJoinedGroupsFromPrefs())
    val joinedGroupsFlow: StateFlow<Set<String>> = _joinedGroups

    // Valid joined = intersection of joined set and existing group names
    val validJoinedGroups: StateFlow<List<String>> =
        combine(dao.getAllGroups(), joinedGroupsFlow) { entities, joined ->
            val existing = entities.map { it.name }.toSet()
            joined.filter { it in existing }.sorted()
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private var seeded = false

    init {
        viewModelScope.launch {
            if (!seeded && dao.count() == 0) {
                // Base groups
                val base = listOf(
                    StudyGroupEntity(
                        name = "Data Structures & Algorithms",
                        description = "Master DSA, code together, and prep for interviews."
                    ),
                    StudyGroupEntity(
                        name = "Beginner’s Python Bootcamp",
                        description = "Ask questions and solve Python problems together."
                    ),
                    StudyGroupEntity(
                        name = "History Buffs Hub",
                        description = "Discuss world history topics, timelines, and figures."
                    ),
                    StudyGroupEntity(
                        name = "French Language Exchange",
                        description = "Practice speaking, listening, and vocabulary."
                    ),
                    // Extra seeded groups
                    StudyGroupEntity(
                        name = "Android Dev Crew",
                        description = "Build Compose UIs, Room DB, and Navigation patterns."
                    ),
                    StudyGroupEntity(
                        name = "Public Speaking Practice",
                        description = "Weekly speech drills and feedback sessions."
                    ),
                    StudyGroupEntity(
                        name = "Linear Algebra Study",
                        description = "Vectors, matrices, and proofs together."
                    ),
                    StudyGroupEntity(
                        name = "Web Dev Essentials",
                        description = "HTML, CSS, JS, and React fundamentals."
                    )
                )

                // Insert groups and capture their generated IDs
                val inserted = mutableListOf<Pair<Int, StudyGroupEntity>>()
                base.forEach { g ->
                    val id = dao.insertGroup(g).toInt()
                    inserted += id to g
                }

                // Seed announcements and tasks per group
                val db = AppDatabase.getDatabase(getApplication())
                val annDao = db.groupAnnouncementDao()
                val taskDao = db.groupTaskDao()

                inserted.forEach { (gid, g) ->
                    // Announcements
                    annDao.insert(
                        GroupAnnouncementEntity(
                            groupId = gid,
                            title = "Welcome to ${g.name}",
                            body = "Introduce yourself and share your goals for this group."
                        )
                    )
                    annDao.insert(
                        GroupAnnouncementEntity(
                            groupId = gid,
                            title = "Weekly meetup",
                            body = "We meet every Wednesday at 6 PM. Check the chat for the link."
                        )
                    )

                    // Tasks
                    taskDao.insert(
                        GroupTaskEntity(
                            groupId = gid,
                            title = "Getting Started",
                            description = "Read the pinned post and set your first goal."
                        )
                    )
                    taskDao.insert(
                        GroupTaskEntity(
                            groupId = gid,
                            title = "Share a resource",
                            description = "Post one helpful link or note for the group."
                        )
                    )
                }

                seeded = true
            }

            // One-time cleanup of stale joined names
            val existing = allGroups.value.map { it.name }.toSet()
            if (existing.isNotEmpty()) {
                val cleaned = _joinedGroups.value.intersect(existing)
                if (cleaned.size != _joinedGroups.value.size) {
                    _joinedGroups.value = cleaned
                    saveJoinedGroupsToPrefs(cleaned)
                }
            }
        }
    }

    private fun loadJoinedGroupsFromPrefs(): Set<String> {
        return prefs.getStringSet("joined_groups", emptySet()) ?: emptySet()
    }

    private fun saveJoinedGroupsToPrefs(groups: Set<String>) {
        prefs.edit().putStringSet("joined_groups", groups).apply()
    }

    fun toggleJoinGroup(groupName: String) {
        val updated = if (_joinedGroups.value.contains(groupName)) {
            _joinedGroups.value - groupName
        } else {
            _joinedGroups.value + groupName
        }
        _joinedGroups.value = updated
        saveJoinedGroupsToPrefs(updated)
    }

    fun addStudyGroup(name: String, description: String) {
        viewModelScope.launch {
            dao.insertGroup(StudyGroupEntity(name = name, description = description))
        }
    }

    fun deleteStudyGroup(id: Int, name: String) {
        viewModelScope.launch {
            dao.deleteGroupById(id)
            val updated = _joinedGroups.value - name
            _joinedGroups.value = updated
            saveJoinedGroupsToPrefs(updated)
        }
    }
}
