// EventListScreen.kt
package ca.gbc.comp3074.campusly

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Group
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import java.text.SimpleDateFormat
import java.util.*

private val eventPurple = Color(0xFF8E24AA)

data class EventFilterOption(val label: String, val value: String)

private val filterOptions = listOf(
    EventFilterOption("All", "all"),
    EventFilterOption("Today", "today"),
    EventFilterOption("This Week", "week"),
    EventFilterOption("Free Events", "free"),
    EventFilterOption("Clubs", "clubs"),
    EventFilterOption("Academic", "academic")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventListScreen(
    viewModel: EventViewModel,
    onEventClick: (Long) -> Unit,
    onNavigateHome: () -> Unit,
    onAddEvent: () -> Unit // if you want a FAB later
) {
    val events by viewModel.allEvents.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var activeFilter by remember { mutableStateOf("all") }

    val filteredEvents = remember(events, searchQuery, activeFilter) {
        events.filter { event ->
            // SEARCH
            val matchesSearch =
                searchQuery.isBlank() ||
                        event.name.contains(searchQuery, ignoreCase = true) ||
                        event.location.contains(searchQuery, ignoreCase = true) ||
                        event.description.contains(searchQuery, ignoreCase = true)

            if (!matchesSearch) return@filter false

            // FILTERS
            when (activeFilter) {
                "all" -> true
                "free" -> event.tags.any { it.equals("Free", ignoreCase = true) }
                "clubs" -> event.category.equals("clubs", ignoreCase = true)
                "academic" -> event.category.equals("academic", ignoreCase = true)
                "today" -> isToday(event.date)
                "week" -> isThisWeek(event.date)
                else -> true
            }
        }
    }

    Scaffold(
        topBar = {
            // White header with back arrow + title, then search bar below
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = onNavigateHome,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            Icons.Default.ArrowBack,
                            contentDescription = "Back to Home",
                            tint = Color(0xFF1F2933)
                        )
                    }
                    Spacer(Modifier.width(8.dp))
                    Text("Events", style = MaterialTheme.typography.titleLarge)
                }

                Spacer(Modifier.height(12.dp))

                // Search bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    singleLine = true,
                    placeholder = { Text("Search events...") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = Color.Gray
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = MaterialTheme.shapes.large
                )
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onAddEvent,
                containerColor = eventPurple,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Event")
            }
        },
        containerColor = Color(0xFFF9FAFB)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // Filter chips row (scrollable horizontally)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                filterOptions.forEach { filter ->
                    FilterChip(
                        selected = activeFilter == filter.value,
                        onClick = { activeFilter = filter.value },
                        label = { Text(filter.label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = eventPurple,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            if (filteredEvents.isEmpty()) {
                // Empty state like Figma: centered icon + text
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(top = 48.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.CalendarMonth,
                        contentDescription = null,
                        tint = Color.LightGray,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(Modifier.height(8.dp))
                    Text("No events found", color = Color.Gray)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredEvents) { event ->
                        EventCardItem(
                            event = event,
                            onClick = { onEventClick(event.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EventCardItem(
    event: EventEntity,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.extraLarge,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        onClick = onClick
    ) {
        Column {
            // Image
            AsyncImage(
                model = event.localImageUri ?: event.imageUrl,
                contentDescription = event.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
            )

            Column(
                modifier = Modifier
                    .padding(16.dp)
            ) {
                Text(
                    text = event.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(Modifier.height(8.dp))

                Column(
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.CalendarMonth,
                            contentDescription = null,
                            tint = Color.Gray,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(Modifier.width(4.dp))
                        Text(
                            text = "${formatDisplayDate(event.date)} • ${event.time}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = Color.Gray,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(Modifier.width(4.dp))
                        Text(
                            text = event.location,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Group,
                            contentDescription = null,
                            tint = Color.Gray,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(Modifier.width(4.dp))
                        Text(
                            text = "${event.attendees} attending",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )
                    }
                }

                Spacer(Modifier.height(8.dp))

                // Tags chips
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.wrapContentWidth()
                ) {
                    event.tags.forEach { tag ->
                        Surface(
                            color = Color(0xFFE3F2FD),
                            shape = MaterialTheme.shapes.large
                        ) {
                            Text(
                                text = tag,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = eventPurple
                            )
                        }
                    }
                }
            }
        }
    }
}

private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
private val displayDateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())

private fun isToday(dateString: String): Boolean {
    return try {
        val date = isoDateFormat.parse(dateString) ?: return false
        val today = isoDateFormat.parse(isoDateFormat.format(Date())) ?: return false
        date == today
    } catch (e: Exception) {
        false
    }
}

private fun isThisWeek(dateString: String): Boolean {
    return try {
        val date = isoDateFormat.parse(dateString) ?: return false
        val calEvent = Calendar.getInstance().apply { time = date }
        val calNow = Calendar.getInstance()
        calEvent.get(Calendar.WEEK_OF_YEAR) == calNow.get(Calendar.WEEK_OF_YEAR) &&
                calEvent.get(Calendar.YEAR) == calNow.get(Calendar.YEAR)
    } catch (e: Exception) {
        false
    }
}

private fun formatDisplayDate(dateString: String): String {
    return try {
        val date = isoDateFormat.parse(dateString)
        if (date != null) displayDateFormat.format(date) else dateString
    } catch (e: Exception) {
        dateString
    }
}
