package ca.gbc.comp3074.campusly

import kotlinx.coroutines.flow.Flow

class PlaceRepository(
    private val dao: PlaceDao
) {
    val places: Flow<List<PlaceEntity>> = dao.getAllPlaces()

    suspend fun getPlaceById(id: Long): PlaceEntity? = dao.getPlaceById(id)

    suspend fun upsertPlace(place: PlaceEntity): Long {
        return if (place.id == 0L) {
            dao.insertPlace(place)
        } else {
            dao.updatePlace(place)
            place.id
        }
    }

    suspend fun deletePlace(place: PlaceEntity) = dao.deletePlace(place)
}
