package ca.gbc.comp3074.campusly

import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class StudyGroupViewModel(application: Application) : AndroidViewModel(application) {

    // DAO for your Study Group database
    private val dao = AppDatabase.getDatabase(application).studyGroupDao()

    // SharedPreferences for persisting join state
    private val prefs: SharedPreferences = application.getSharedPreferences("joined_groups_prefs", Context.MODE_PRIVATE)

    // Groups mapped into StateFlow for UI
    val allGroups: StateFlow<List<StudyGroup>> = dao.getAllGroups()
        .map { list -> list.map { StudyGroup(it.name, it.description) } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // MutableState for joined groups, initialized from SharedPreferences
    private val _joinedGroups = mutableStateOf(loadJoinedGroupsFromPrefs())
    val joinedGroups get() = _joinedGroups.value

    // Load joined groups from SharedPreferences
    private fun loadJoinedGroupsFromPrefs(): Set<String> {
        return prefs.getStringSet("joined_groups", emptySet()) ?: emptySet()
    }

    // Save joined groups to SharedPreferences
    private fun saveJoinedGroupsToPrefs(groups: Set<String>) {
        prefs.edit().putStringSet("joined_groups", groups).apply()
    }

    // Toggle join state (add/remove) and persist
    fun toggleJoinGroup(groupName: String) {
        val updatedGroups = if (_joinedGroups.value.contains(groupName)) {
            _joinedGroups.value - groupName
        } else {
            _joinedGroups.value + groupName
        }
        _joinedGroups.value = updatedGroups
        saveJoinedGroupsToPrefs(updatedGroups)
    }

    // Add new study group to database
    fun addStudyGroup(name: String, description: String) {
        viewModelScope.launch {
            dao.insertGroup(StudyGroupEntity(name = name, description = description))
        }
    }
}
