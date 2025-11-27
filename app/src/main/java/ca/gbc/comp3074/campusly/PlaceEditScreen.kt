package ca.gbc.comp3074.campusly

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Label
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
fun PlaceEditScreen(
    id: Long,
    viewModel: PlacesViewModel,
    onDone: () -> Unit,
    onCancel: () -> Unit
) {
    // ---------- State ----------
    var name by rememberSaveable { mutableStateOf("") }
    var address by rememberSaveable { mutableStateOf("") }
    var tags by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var desc by rememberSaveable { mutableStateOf("") }
    var imageUri by rememberSaveable { mutableStateOf<String?>(null) }

    val scope = rememberCoroutineScope()

    // ---------- Load existing data ----------
    LaunchedEffect(id) {
        if (id != -1L) {
            viewModel.getPlaceById(id)?.let { place ->
                name = place.name
                address = place.campus
                tags = place.tags.joinToString(", ")
                desc = place.description
                imageUri = place.imageUri
            }
        }
    }

    // ---------- Image Picker ----------
    val imagePickerLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri -> imageUri = uri?.toString() }

    val bg = Color(0xFFF2F2F6)

    Scaffold(
        containerColor = bg,

        // ---------------- HEADER ----------------
        topBar = {
            Column {
                Spacer(Modifier.height(18.dp))
                Box(
                    Modifier
                        .fillMaxWidth()
                        .background(Color.White)
                        .padding(horizontal = 20.dp, vertical = 14.dp)
                ) {
                    Text(
                        if (id == -1L) "Add Place" else "Edit Place",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                }
                Divider(color = Color(0xFFE5E5EA))
            }
        },

        // ---------------- BOTTOM BUTTONS ----------------
        bottomBar = {
            Box(
                Modifier
                    .background(Color.White)
                    .padding(16.dp)
            ) {
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onCancel,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            val entity = PlaceEntity(
                                id = if (id == -1L) 0L else id,
                                name = name,
                                campus = address,
                                description = desc,
                                rating = 0.0,
                                tags = if (tags.isBlank()) emptyList()
                                else tags.split(",").map { it.trim() },
                                isFeatured = false,
                                imageUri = imageUri
                            )

                            scope.launch {
                                viewModel.addOrUpdatePlace(entity)
                                onDone()
                            }
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text("Save")
                    }
                }
            }
        }
    ) { padding ->

        Column(
            Modifier
                .padding(padding)
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {

            RoundedInput(
                label = "Name",
                placeholder = "Enter place name",
                icon = Icons.Default.Person,
                value = name,
                onValueChange = { name = it }
            )

            RoundedInput(
                label = "Address",
                placeholder = "Enter full address",
                icon = Icons.Default.LocationOn,
                value = address,
                onValueChange = { address = it }
            )

            Column {
                RoundedInput(
                    label = "Tags",
                    placeholder = "Study Space, WiFi, 24/7 Access",
                    icon = Icons.AutoMirrored.Filled.Label,
                    value = tags,
                    onValueChange = { tags = it }
                )
                Text("Use commas to add multiple tags.", color = Color.Gray)
            }

            RoundedInput(
                label = "Phone",
                placeholder = "(555) 123-4567",
                icon = Icons.Default.Phone,
                value = phone,
                onValueChange = { phone = it }
            )

            RoundedInput(
                label = "Description",
                placeholder = "Describe the place...",
                icon = Icons.Default.Description,
                value = desc,
                onValueChange = { desc = it },
                singleLine = false,
                height = 120.dp
            )

            Column {
                Text("Upload Photo", fontWeight = FontWeight.Bold)

                OutlinedButton(
                    onClick = { imagePickerLauncher.launch("image/*") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        if (imageUri == null) "Choose File" else "Image Selected ✔"
                    )
                }
            }

            Spacer(Modifier.weight(1f))
        }
    }
}

@Composable
private fun RoundedInput(
    label: String,
    placeholder: String,
    icon: ImageVector,
    value: String,
    onValueChange: (String) -> Unit,
    singleLine: Boolean = true,
    height: Dp = 56.dp
) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(label, fontWeight = FontWeight.Bold)

        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, color = Color.Gray) },
            leadingIcon = { Icon(icon, null, tint = Color.Gray) },
            modifier = Modifier
                .fillMaxWidth()
                .height(height),
            shape = RoundedCornerShape(14.dp),
            singleLine = singleLine
        )
    }
}
