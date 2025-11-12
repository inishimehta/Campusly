package ca.gbc.comp3074.campusly

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class GroupViewModel(app: Application) : AndroidViewModel(app) {
    private val db = AppDatabase.getDatabase(app)
    private val announcementDao = db.groupAnnouncementDao()
    private val taskDao = db.groupTaskDao()

    private val groupId = MutableStateFlow<Int?>(null)
    private val _statusFilter = MutableStateFlow<TaskStatus?>(null)
    val statusFilter: StateFlow<TaskStatus?> = _statusFilter.asStateFlow()

    val announcements: StateFlow<List<GroupAnnouncementEntity>> =
        groupId.filterNotNull()
            .flatMapLatest { announcementDao.streamByGroup(it) }
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val tasks: StateFlow<List<GroupTaskEntity>> =
        combine(groupId.filterNotNull(), _statusFilter) { gid, f -> gid to f }
            .flatMapLatest { (gid, f) -> taskDao.streamByGroup(gid, f) }
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val progress: StateFlow<ProgressRow> =
        groupId.filterNotNull()
            .flatMapLatest { taskDao.progress(it) }
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), ProgressRow(0,0))

    fun load(gid: Int) { groupId.value = gid }

    fun setFilter(f: TaskStatus?) { _statusFilter.value = f }

    fun addAnnouncement(title: String, body: String) {
        val gid = groupId.value ?: return
        viewModelScope.launch {
            announcementDao.insert(
                GroupAnnouncementEntity(groupId = gid, title = title, body = body)
            )
        }
    }

    fun togglePin(id: Int, pinned: Boolean) = viewModelScope.launch {
        announcementDao.togglePin(id, pinned)
    }

    fun addTask(title: String, description: String = "") {
        val gid = groupId.value ?: return
        viewModelScope.launch {
            taskDao.insert(
                GroupTaskEntity(groupId = gid, title = title, description = description)
            )
        }
    }

    fun setTaskStatus(id: Int, status: TaskStatus) = viewModelScope.launch {
        taskDao.setStatus(id, status)
    }
}
