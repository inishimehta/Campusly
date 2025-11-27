package ca.gbc.comp3074.campusly

import android.app.Application
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import ca.gbc.comp3074.campusly.ui.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { CampuslyApp() }
    }
}

@Composable
fun CampuslyApp() {
    val nav = rememberNavController()
    val app = LocalContext.current.applicationContext as Application

    // ✅ One shared PlacesViewModel for all place screens
    val placesVm: PlacesViewModel = viewModel(
        //factory = PlacesViewModelFactory(app)
    )

    MaterialTheme {
        NavHost(
            navController = nav,
            startDestination = "splash"
        ) {

            // -------------------------------------------------------------
            // Splash Screen
            // -------------------------------------------------------------
            composable("splash") {
                SplashScreen(
                    onDone = {
                        nav.navigate("home") {
                            popUpTo("splash") { inclusive = true }
                        }
                    }
                )
            }

            // -------------------------------------------------------------
            // Home Screen
            // -------------------------------------------------------------
            composable("home") {
                HomeScreen(
                    onPlaces = { nav.navigate("places") },
                    onEvents = { nav.navigate("eventList") },
                    onStudyGroups = { nav.navigate("studyGroups") },
                    onAnnouncements = { nav.navigate("announcements") },
                    onAbout = { nav.navigate("about") },
                    onNavigateHome = {
                        nav.navigate("home") {
                            popUpTo("home") { inclusive = true }
                        }
                    }
                )
            }

            // -------------------------------------------------------------
            // Announcements Screen (CRUD)
            // -------------------------------------------------------------
            composable("announcements") {
                val announcementVm: AnnouncementViewModel = viewModel(
                    factory = ViewModelProvider.AndroidViewModelFactory(
                        LocalContext.current.applicationContext as android.app.Application
                    )
                )
                AnnouncementsScreen(
                    viewModel = announcementVm,
                    onBack = { nav.popBackStack() }
                )
            }

            // ---------------------------------------------------
            // Places List
            // ---------------------------------------------------
            composable("places") {
                PlacesListScreen(
                    viewModel = placesVm,
                    onOpenDetails = { id -> nav.navigate("placeDetails/$id") },
                    onAdd = { nav.navigate("placeEdit?id=-1") },
                    onBack = { nav.popBackStack() }
                )
            }

            // ---------------------------------------------------
            // Place Details
            // ---------------------------------------------------
            composable(
                route = "placeDetails/{id}",
                arguments = listOf(navArgument("id")
                {
                    type = NavType.LongType
                })
            ) { backStack ->
                val id = backStack.arguments?.getLong("id") ?: -1L

                PlaceDetailsScreen(
                    id = id,
                    vm = placesVm,
                    onBack = { nav.popBackStack() },
                    onEdit = { nav.navigate("placeEdit?id=$id") },
                    onNavigateToPlace = { newId ->
                        nav.navigate("placeDetails/$newId") { launchSingleTop = true }
                    },
                    onOpenMap = { address ->
                        nav.navigate("mapScreen/$address")
                    }
                )
            }

            // ---------------------------------------------------
            // Place Edit Screen
            // ---------------------------------------------------
            composable(
                route = "placeEdit?id={id}",
                arguments = listOf(navArgument("id") {
                    type = NavType.LongType
                    defaultValue = -1L
                })
            ) { backStack ->
                val id = backStack.arguments?.getLong("id") ?: -1L

                PlaceEditScreen(
                    id = id,
                    viewModel = placesVm,
                    onDone = {
                        nav.navigate("places") {
                            popUpTo("places") { inclusive = false }
                        }
                    },
                    onCancel = { nav.popBackStack() }
                )
            }

            // ---------------------------------------------------
            // View Full Map Screen
            // ---------------------------------------------------
            composable(
                "mapScreen/{address}",
                arguments = listOf(navArgument("address") { type = NavType.StringType })
            ) { backStack ->
                val address = backStack.arguments?.getString("address") ?: ""
                MapScreen(
                    address = address,
                    onBack = { nav.popBackStack() }
                )
            }


            // -------------------------------------------------------------
            // Study Groups
            // -------------------------------------------------------------
            composable("studyGroups") {
                val vm: StudyGroupViewModel = viewModel(
                    factory = ViewModelProvider.AndroidViewModelFactory(
                        LocalContext.current.applicationContext as android.app.Application
                    )
                )
                StudyGroupsScreen(
                    viewModel = vm,
                    onBack = { nav.popBackStack() },
                    onGoHome = {
                        nav.navigate("home") {
                            popUpTo("home") { inclusive = true }
                        }
                    },
                    onOpenGroup = { id, name -> nav.navigate("group/$id/$name") }
                )
            }

            // -------------------------------------------------------------
            // Study Group Details (Announcements + Tasks)
            // -------------------------------------------------------------
            composable("group/{id}/{name}") { backStackEntry ->
                val id = backStackEntry.arguments?.getString("id")?.toInt() ?: return@composable
                val name = backStackEntry.arguments?.getString("name") ?: "Study Group"

                val groupVm: GroupViewModel = viewModel(
                    factory = ViewModelProvider.AndroidViewModelFactory(
                        LocalContext.current.applicationContext as android.app.Application
                    )
                )

                StudyGroupDetailScreen(
                    groupId = id,
                    groupName = name,
                    vm = groupVm,
                    onBack = { nav.popBackStack() }
                )
            }

            // -------------------------------------------------------------
            // Event List
            // -------------------------------------------------------------
            composable("eventList") {
                val eventViewModel: EventViewModel = viewModel(
                    factory = EventViewModelFactory(
                        LocalContext.current.applicationContext as android.app.Application
                    )
                )
                EventListScreen(
                    viewModel = eventViewModel,
                    onEventClick = { id -> nav.navigate("eventDetails/$id") },
                    onAddEvent = { nav.navigate("eventUpdate/-1") },
                    onNavigateHome = { nav.navigate("home") { popUpTo("home") { inclusive = true } } }
                )
            }

            // -------------------------------------------------------------
            // Event Details
            // -------------------------------------------------------------
            composable("eventDetails/{eventId}") { backStackEntry ->
                val eventId = backStackEntry.arguments?.getString("eventId")?.toLong() ?: -1L
                val eventViewModel: EventViewModel = viewModel(
                    factory = EventViewModelFactory(
                        LocalContext.current.applicationContext as android.app.Application
                    )
                )
                EventDetailsScreen(
                    eventId = eventId,
                    viewModel = eventViewModel,
                    onEditClick = { id -> nav.navigate("eventUpdate/$id") },
                    onBack = { nav.popBackStack() }
                )
            }

            // -------------------------------------------------------------
            // Event Update/Edit Screen
            // -------------------------------------------------------------
            composable("eventUpdate/{eventId}") { backStackEntry ->
                val eventId = backStackEntry.arguments?.getString("eventId")?.toLong() ?: -1L
                val eventViewModel: EventViewModel = viewModel(
                    factory = EventViewModelFactory(
                        LocalContext.current.applicationContext as android.app.Application
                    )
                )
                UpdateEventScreen(
                    eventId = eventId,
                    viewModel = eventViewModel,
                    onSave = { nav.popBackStack() },
                    onCancel = { nav.popBackStack() }
                )
            }

            // -------------------------------------------------------------
            // About Screen
            // -------------------------------------------------------------
            composable("about") {
                AboutScreen(
                    onBack = { nav.popBackStack() },
                    onNavigateHome = {
                        nav.navigate("home") {
                            popUpTo("home") { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}
