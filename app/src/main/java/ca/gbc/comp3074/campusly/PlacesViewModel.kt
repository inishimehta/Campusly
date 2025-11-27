package ca.gbc.comp3074.campusly

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import ca.gbc.comp3074.campusly.data.CampuslyFakeData
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class PlacesViewModel(app: Application) : AndroidViewModel(app) {

    private val db = AppDatabase.getDatabase(app)
    private val repo = PlaceRepository(db.placeDao())

    val places = repo.places

    init {
        viewModelScope.launch {
            val existing = repo.places.first()
            if (existing.isEmpty()) {
                insertFakeData()
            }
        }
    }

    private suspend fun insertFakeData() {
        CampuslyFakeData.places.forEach { entity ->
            repo.upsertPlace(entity)
        }
    }

    suspend fun getPlaceById(id: Long): PlaceEntity? = repo.getPlaceById(id)

    fun addOrUpdatePlace(entity: PlaceEntity) = viewModelScope.launch {
        repo.upsertPlace(entity)
    }

    fun deletePlace(entity: PlaceEntity) = viewModelScope.launch {
        repo.deletePlace(entity)
    }
}
