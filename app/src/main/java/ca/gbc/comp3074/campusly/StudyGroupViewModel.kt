package ca.gbc.comp3074.campusly

import android.app.Application
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class StudyGroupViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = AppDatabase.getDatabase(application).studyGroupDao()

    val allGroups: StateFlow<List<StudyGroup>> = dao.getAllGroups()
        .map { list -> list.map { StudyGroup(it.name, it.description) } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _joinedGroups = mutableStateOf(setOf<String>())
    val joinedGroups get() = _joinedGroups.value

    fun toggleJoinGroup(groupName: String) {
        _joinedGroups.value = if (_joinedGroups.value.contains(groupName)) {
            _joinedGroups.value - groupName
        } else {
            _joinedGroups.value + groupName
        }
    }

    fun addStudyGroup(name: String, description: String) {
        viewModelScope.launch {
            dao.insertGroup(StudyGroupEntity(name = name, description = description))
        }
    }
}
