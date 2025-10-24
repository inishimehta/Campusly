package ca.gbc.comp3074.campusly

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class EventViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = AppDatabase.getDatabase(application).eventDao()

    val allEvents: StateFlow<List<EventEntity>> = dao.getAllEvents()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val goingEvents: StateFlow<List<EventEntity>> = allEvents
        .map { list -> list.filter { it.rsvp } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun addEvent(name: String, location: String, dateTime: String, description: String) {
        viewModelScope.launch {
            dao.insertEvent(EventEntity(name = name, location = location, dateTime = dateTime, description = description))
        }
    }

    fun deleteEvent(event: EventEntity) {
        viewModelScope.launch {
            dao.deleteEvent(event)
        }
    }

    fun getEventById(id: Long): Flow<EventEntity?> {
        return dao.getEventById(id)
    }

    fun updateEvent(updatedEvent: EventEntity) {
        viewModelScope.launch {
            dao.updateEvent(updatedEvent)
        }
    }

    fun toggleRsvp(event: EventEntity) {
        viewModelScope.launch {
            val updatedEvent = event.copy(rsvp = !event.rsvp)
            dao.updateEvent(updatedEvent)
        }
    }
}
