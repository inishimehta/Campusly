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

//// Data class for UI, matching the entity structure
//data class StudyGroup(val id: Int, val name: String, val description: String)

class StudyGroupViewModel(application: Application) : AndroidViewModel(application) {

    // DAO for your Study Group database
    private val dao = AppDatabase.getDatabase(application).studyGroupDao()

    // SharedPreferences for persisting join state
    private val prefs: SharedPreferences = application.getSharedPreferences("joined_groups_prefs", Context.MODE_PRIVATE)

    // Groups mapped into StateFlow for UI - now includes id
    val allGroups: StateFlow<List<StudyGroup>> = dao.getAllGroups()
        .map { list -> list.map { StudyGroup(it.id, it.name, it.description) } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // MutableState for joined groups, initialized from SharedPreferences
    private val _joinedGroups = mutableStateOf(loadJoinedGroupsFromPrefs())
    val joinedGroups get() = _joinedGroups.value

    // Only show joined groups that currently exist
    val validJoinedGroups: StateFlow<List<String>> = allGroups
        .map { groups ->
            val groupNames = groups.map { it.name }
            val valid = joinedGroups.filter { groupNames.contains(it) }
            // Save only valid groups back to preferences for a true cleanup effect
            if (valid.size != joinedGroups.size) {
                _joinedGroups.value = valid.toSet()
                saveJoinedGroupsToPrefs(valid.toSet())
            }
            valid
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

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

    // Delete study group from database (needs DAO implementation)
    fun deleteStudyGroup(id: Int, name: String) {
        viewModelScope.launch {
            dao.deleteGroupById(id)
            // Clean up joined groups to remove this group
            val updatedGroups = _joinedGroups.value - name
            _joinedGroups.value = updatedGroups
            saveJoinedGroupsToPrefs(updatedGroups)
        }
    }
}
