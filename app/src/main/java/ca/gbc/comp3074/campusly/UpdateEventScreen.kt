package ca.gbc.comp3074.campusly

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

private val EventPurple = Color(0xFF8E24AA)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UpdateEventScreen(
    eventId: Long,
    viewModel: EventViewModel,
    onSave: () -> Unit,
    onCancel: () -> Unit
) {
    val scope = rememberCoroutineScope()
    val lazyListState = rememberLazyListState()

    val existingEvent = if (eventId != -1L) {
        viewModel.getEventById(eventId).collectAsState(initial = null).value
    } else null

    var name by rememberSaveable { mutableStateOf("") }
    var date by rememberSaveable { mutableStateOf("") }
    var time by rememberSaveable { mutableStateOf("") }
    var location by rememberSaveable { mutableStateOf("") }
    var category by rememberSaveable { mutableStateOf("") }
    var tagsInput by rememberSaveable { mutableStateOf("") }
    var attendeesInput by rememberSaveable { mutableStateOf("") }
    var description by rememberSaveable { mutableStateOf("") }
    var imageUrl by rememberSaveable { mutableStateOf("") }
    var localImageUri by rememberSaveable { mutableStateOf<String?>(null) }

    var nameError by remember { mutableStateOf(false) }
    var dateError by remember { mutableStateOf(false) }
    var timeError by remember { mutableStateOf(false) }
    var locationError by remember { mutableStateOf(false) }
    var attendeesError by remember { mutableStateOf(false) }
    var categoryError by remember { mutableStateOf(false) }

    // Pre-fill for editing
    LaunchedEffect(existingEvent?.id) {
        existingEvent?.let {
            name = it.name
            date = it.date
            time = it.time
            location = it.location
            category = it.category
            tagsInput = it.tags.joinToString(", ")
            attendeesInput = it.attendees.toString()
            description = it.description
            imageUrl = it.imageUrl.orEmpty()
            localImageUri = it.localImageUri
        }
    }

    val imagePickerLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        localImageUri = uri?.toString()
    }

    val categoryOptions = listOf("clubs", "academic", "sports", "arts", "other")
    var categoryDropdownExpanded by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = if (eventId == -1L) "Add Event" else "Edit Event",
                        fontWeight = FontWeight.SemiBold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onCancel) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = EventPurple,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        },
        bottomBar = {
            // Sticky Save Button
            Surface(
                tonalElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    OutlinedButton(onClick = onCancel) {
                        Text("Cancel")
                    }

                    Button(onClick = {
                        // Validation
                        nameError = name.isBlank()
                        locationError = location.isBlank()
                        dateError = !isValidDate(date)
                        timeError = !isValidTime(time)
                        val attendeesInt = attendeesInput.toIntOrNull()
                        attendeesError = attendeesInt == null || attendeesInt < 0
                        categoryError = category.isBlank()

                        val hasError = nameError || locationError || dateError ||
                                timeError || attendeesError || categoryError

                        if (!hasError) {
                            val tagsList = tagsInput.split(",")
                                .map { it.trim() }
                                .filter { it.isNotEmpty() }

                            scope.launch {
                                if (eventId == -1L) {
                                    viewModel.addEvent(
                                        name = name,
                                        location = location,
                                        date = date,
                                        time = time,
                                        description = description,
                                        category = category,
                                        tags = tagsList,
                                        attendees = attendeesInt ?: 0,
                                        imageUrl = imageUrl.ifBlank { null },
                                        localImageUri = localImageUri
                                    )
                                } else {
                                    existingEvent?.let { old ->
                                        val updated = old.copy(
                                            name = name,
                                            location = location,
                                            date = date,
                                            time = time,
                                            description = description,
                                            category = category,
                                            tags = tagsList,
                                            attendees = attendeesInt ?: 0,
                                            imageUrl = imageUrl.ifBlank { null },
                                            localImageUri = localImageUri
                                        )
                                        viewModel.updateEvent(updated)
                                    }
                                }
                                onSave()
                            }
                        }
                    }) {
                        Icon(Icons.Default.Check, contentDescription = "Save")
                        Spacer(Modifier.width(6.dp))
                        Text("Save")
                    }
                }
            }
        }
    ) { padding ->

        // SCROLLABLE FORM
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            state = lazyListState,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {

            // Name
            item {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it; nameError = false },
                    label = { Text("Event Name") },
                    leadingIcon = { Icon(Icons.Default.Event, null) },
                    modifier = Modifier.fillMaxWidth(),
                    isError = nameError
                )
                if (nameError)
                    Text("Name cannot be empty", color = MaterialTheme.colorScheme.error)
            }

            // Date
            item {
                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it; dateError = false },
                    label = { Text("Date (YYYY-MM-DD)") },
                    leadingIcon = { Icon(Icons.Default.CalendarMonth, null) },
                    modifier = Modifier.fillMaxWidth(),
                    isError = dateError
                )
                if (dateError)
                    Text("Enter a valid date (YYYY-MM-DD)", color = MaterialTheme.colorScheme.error)
            }

            // Time
            item {
                OutlinedTextField(
                    value = time,
                    onValueChange = { time = it; timeError = false },
                    label = { Text("Time (HH:MM 24-hour)") },
                    leadingIcon = { Icon(Icons.Default.AccessTime, null) },
                    modifier = Modifier.fillMaxWidth(),
                    isError = timeError
                )
                if (timeError)
                    Text("Enter a valid time (HH:MM)", color = MaterialTheme.colorScheme.error)
            }

            // Location
            item {
                OutlinedTextField(
                    value = location,
                    onValueChange = { location = it; locationError = false },
                    label = { Text("Location") },
                    leadingIcon = { Icon(Icons.Default.LocationOn, null) },
                    modifier = Modifier.fillMaxWidth(),
                    isError = locationError
                )
                if (locationError)
                    Text("Location cannot be empty", color = MaterialTheme.colorScheme.error)
            }

            // Category dropdown
            item {
                ExposedDropdownMenuBox(
                    expanded = categoryDropdownExpanded,
                    onExpandedChange = { categoryDropdownExpanded = it }
                ) {
                    OutlinedTextField(
                        value = category,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Category") },
                        leadingIcon = { Icon(Icons.Default.Label, null) },
                        trailingIcon = {
                            ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryDropdownExpanded)
                        },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth(),
                        isError = categoryError
                    )
                    ExposedDropdownMenu(
                        expanded = categoryDropdownExpanded,
                        onDismissRequest = { categoryDropdownExpanded = false }
                    ) {
                        categoryOptions.forEach { option ->
                            DropdownMenuItem(
                                text = { Text(option.replaceFirstChar { it.uppercaseChar() }) },
                                onClick = {
                                    category = option
                                    categoryDropdownExpanded = false
                                    categoryError = false
                                }
                            )
                        }
                    }
                }
                if (categoryError)
                    Text("Category required", color = MaterialTheme.colorScheme.error)
            }

            // Tags
            item {
                OutlinedTextField(
                    value = tagsInput,
                    onValueChange = { tagsInput = it },
                    label = { Text("Tags (comma separated)") },
                    leadingIcon = { Icon(Icons.Default.Tag, null) },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Attendees
            item {
                OutlinedTextField(
                    value = attendeesInput,
                    onValueChange = { attendeesInput = it; attendeesError = false },
                    label = { Text("Expected attendees") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    leadingIcon = { Icon(Icons.Default.Group, null) },
                    modifier = Modifier.fillMaxWidth(),
                    isError = attendeesError
                )
                if (attendeesError)
                    Text("Enter a valid number", color = MaterialTheme.colorScheme.error)
            }

            // Description
            item {
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    leadingIcon = { Icon(Icons.Default.Description, null) },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 4
                )
            }

            // Image URL
            item {
                OutlinedTextField(
                    value = imageUrl,
                    onValueChange = { imageUrl = it },
                    label = { Text("Image URL (optional)") },
                    leadingIcon = { Icon(Icons.Default.Link, null) },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Local Image Picker
            item {
                OutlinedButton(
                    onClick = { imagePickerLauncher.launch("image/*") },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Image, null)
                    Spacer(Modifier.width(8.dp))
                    Text(if (localImageUri == null) "Pick from gallery" else "Change image")
                }
            }

            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}

// Validation helpers
private fun isValidDate(input: String): Boolean {
    return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        sdf.isLenient = false
        sdf.parse(input)
        true
    } catch (_: Exception) {
        false
    }
}

private fun isValidTime(input: String): Boolean {
    return try {
        val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
        sdf.isLenient = false
        sdf.parse(input)
        true
    } catch (_: Exception) {
        false
    }
}
