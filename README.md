WorkoutRPG/
├── WorkoutRPG.xcodeproj/          (особый файл — создаем отдельно, см. ниже)
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXBuildFile section */
		1234567890ABCDEF /* WorkoutRPGApp.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* WorkoutRPGApp.swift */; };
		1234567890ABCDEF /* CoreDataManager.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* CoreDataManager.swift */; };
		1234567890ABCDEF /* ContentView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* ContentView.swift */; };
		1234567890ABCDEF /* CalendarView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* CalendarView.swift */; };
		1234567890ABCDEF /* TemplateListView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* TemplateListView.swift */; };
		1234567890ABCDEF /* TemplateEditorView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* TemplateEditorView.swift */; };
		1234567890ABCDEF /* ExerciseEditorView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* ExerciseEditorView.swift */; };
		1234567890ABCDEF /* ProgressView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* ProgressView.swift */; };
		1234567890ABCDEF /* StatCard.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* StatCard.swift */; };
		1234567890ABCDEF /* CalendarViewModel.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* CalendarViewModel.swift */; };
		1234567890ABCDEF /* TemplateViewModel.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* TemplateViewModel.swift */; };
		1234567890ABCDEF /* PlayerViewModel.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* PlayerViewModel.swift */; };
		1234567890ABCDEF /* DateExtensions.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1234567890ABCDEF /* DateExtensions.swift */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		1234567890ABCDEF /* WorkoutRPG.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = WorkoutRPG.app; sourceTree = BUILT_PRODUCTS_DIR; };
		1234567890ABCDEF /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };
/* End PBXFileReference section */

/* Begin PBXGroup section */
		1234567890ABCDEF = {
			isa = PBXGroup;
			children = (
				1234567890ABCDEF /* WorkoutRPG */,
				1234567890ABCDEF /* Products */,
			);
			sourceTree = "<group>";
		};
		1234567890ABCDEF /* WorkoutRPG */ = {
			isa = PBXGroup;
			children = (
				1234567890ABCDEF /* Info.plist */,
				1234567890ABCDEF /* WorkoutRPGApp.swift */,
				1234567890ABCDEF /* Models */,
				1234567890ABCDEF /* Views */,
				1234567890ABCDEF /* ViewModels */,
				1234567890ABCDEF /* Extensions */,
			);
			path = WorkoutRPG;
			sourceTree = "<group>";
		};
		1234567890ABCDEF /* Products */ = {
			isa = PBXGroup;
			children = (
				1234567890ABCDEF /* WorkoutRPG.app */,
			);
			name = Products;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXSourcesBuildPhase section */
		1234567890ABCDEF /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				1234567890ABCDEF /* WorkoutRPGApp.swift in Sources */,
				1234567890ABCDEF /* CoreDataManager.swift in Sources */,
				1234567890ABCDEF /* ContentView.swift in Sources */,
				1234567890ABCDEF /* CalendarView.swift in Sources */,
				1234567890ABCDEF /* TemplateListView.swift in Sources */,
				1234567890ABCDEF /* TemplateEditorView.swift in Sources */,
				1234567890ABCDEF /* ExerciseEditorView.swift in Sources */,
				1234567890ABCDEF /* ProgressView.swift in Sources */,
				1234567890ABCDEF /* StatCard.swift in Sources */,
				1234567890ABCDEF /* CalendarViewModel.swift in Sources */,
				1234567890ABCDEF /* TemplateViewModel.swift in Sources */,
				1234567890ABCDEF /* PlayerViewModel.swift in Sources */,
				1234567890ABCDEF /* DateExtensions.swift in Sources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		1234567890ABCDEF /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_ENABLE_OBJC_WEAK = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_COMMA = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = dwarf;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_TESTABILITY = YES;
				ENABLE_USER_SCRIPT_SANDBOXING = YES;
				GCC_C_LANGUAGE_STANDARD = gnu17;
				GCC_DYNAMIC_NO_PIC = NO;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_OPTIMIZATION_LEVEL = 0;
				GCC_PREPROCESSOR_DEFINITIONS = (
					"DEBUG=1",
					"$(inherited)",
				);
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 16.0;
				MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
				MTL_FAST_MATH = YES;
				ONLY_ACTIVE_ARCH = YES;
				SDKROOT = iphoneos;
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = "DEBUG $(inherited)";
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		1234567890ABCDEF /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION = YES_AGGRESSIVE;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_ENABLE_OBJC_WEAK = YES;
				CLANG_WARN_BLOCK_CAPTURE_AUTORELEASING = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_COMMA = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DEPRECATED_OBJC_IMPLEMENTATIONS = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_DOCUMENTATION_COMMENTS = YES;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INFINITE_RECURSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_NON_LITERAL_NULL_CONVERSION = YES;
				CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF = YES;
				CLANG_WARN_OBJC_LITERAL_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER = YES;
				CLANG_WARN_RANGE_LOOP_ANALYSIS = YES;
				CLANG_WARN_STRICT_PROTOTYPES = YES;
				CLANG_WARN_SUSPICIOUS_MOVE = YES;
				CLANG_WARN_UNGUARDED_AVAILABILITY = YES_AGGRESSIVE;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
				ENABLE_NS_ASSERTIONS = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_USER_SCRIPT_SANDBOXING = YES;
				GCC_C_LANGUAGE_STANDARD = gnu17;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 16.0;
				MTL_ENABLE_DEBUG_INFO = NO;
				MTL_FAST_MATH = YES;
				SDKROOT = iphoneos;
				SWIFT_COMPILATION_MODE = wholemodule;
				TARGETED_DEVICE_FAMILY = "1,2";
				VALIDATE_PRODUCT = YES;
			};
			name = Release;
		};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		1234567890ABCDEF /* Build configuration list for PBXProject "WorkoutRPG" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				1234567890ABCDEF /* Debug */,
				1234567890ABCDEF /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
/* End XCConfigurationList section */
	};
	rootObject = 1234567890ABCDEF /* Project object */;
}
├── WorkoutRPG/
│   ├── Info.plist                   (файл настроек)
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UIApplicationSceneManifest</key>
	<dict>
		<key>UIApplicationSupportsMultipleScenes</key>
		<false/>
	</dict>
	<key>UILaunchScreen</key>
	<dict/>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>armv7</string>
	</array>
	<key>UISupportedInterfaceOrientations~iphone</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
	</array>
</dict>
</plist>
│   ├── WorkoutRPGApp.swift          (точка входа)
            import SwiftUI

@main
struct WorkoutRPGApp: App {
    let persistenceController = CoreDataManager.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.viewContext)
        }
    }
}
│   ├── Models/
│   │   ├── CoreData.xcdatamodeld    (модель базы данных — создаем через Xcode)
│   │   └── CoreDataManager.swift
import CoreData
import SwiftUI

class CoreDataManager {
    static let shared = CoreDataManager()
    
    let container: NSPersistentContainer
    
    init() {
        container = NSPersistentContainer(name: "CoreData")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Ошибка Core Data: \(error)")
            }
        }
    }
    
    var viewContext: NSManagedObjectContext {
        container.viewContext
    }
    
    func save() {
        if viewContext.hasChanges {
            try? viewContext.save()
        }
    }
}
│   ├── Views/
│   │   ├── ContentView.swift
import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            CalendarView()
                .tabItem {
                    Label("Календарь", systemImage: "calendar")
                }
                .tag(0)
            
            TemplateListView()
                .tabItem {
                    Label("Шаблоны", systemImage: "list.bullet")
                }
                .tag(1)
            
            ProgressView()
                .tabItem {
                    Label("Прогресс", systemImage: "chart.bar")
                }
                .tag(2)
        }
    }
}
│   │   ├── CalendarView.swiftimport SwiftUI

struct CalendarView: View {
    @StateObject private var viewModel = CalendarViewModel()
    @State private var selectedDate = Date()
    
    let daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    let columns = Array(repeating: GridItem(.flexible()), count: 7)
    
    var body: some View {
        NavigationStack {
            VStack {
                // Заголовок
                HStack {
                    Button("<<") {
                        selectedDate = Calendar.current.date(byAdding: .month, value: -1, to: selectedDate)!
                    }
                    Spacer()
                    Text(selectedDate.formatted(.dateTime.month(.wide).year()))
                        .font(.title2.bold())
                    Spacer()
                    Button(">>") {
                        selectedDate = Calendar.current.date(byAdding: .month, value: 1, to: selectedDate)!
                    }
                }
                .padding()
                
                // Дни недели
                LazyVGrid(columns: columns) {
                    ForEach(daysOfWeek, id: \.self) { day in
                        Text(day)
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                
                // Дни месяца
                LazyVGrid(columns: columns) {
                    ForEach(viewModel.getDaysInMonth(date: selectedDate), id: \.self) { date in
                        if let date = date {
                            let day = Calendar.current.component(.day, from: date)
                            let isWorkout = viewModel.hasWorkout(on: date)
                            
                            Text("\(day)")
                                .frame(height: 40)
                                .frame(maxWidth: .infinity)
                                .background(isWorkout ? Color.green.opacity(0.4) : Color.clear)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .onTapGesture {
                                    selectedDate = date
                                    viewModel.markWorkout(on: date)
                                }
                        } else {
                            Text("")
                                .frame(height: 40)
                        }
                    }
                }
                .padding(.horizontal)
                
                Spacer()
                
                // Инфо о статистике
                HStack {
                    StatCard(value: "\(viewModel.totalWorkouts)", label: "Всего")
                    StatCard(value: "\(viewModel.streak)", label: "Серия")
                    StatCard(value: "\(viewModel.level)", label: "Уровень")
                }
                .padding()
            }
            .navigationTitle("Тренировки")
            .onAppear {
                viewModel.loadData()
            }
        }
    }
}
│   │   ├── TemplateListView.swift
import SwiftUI

struct TemplateListView: View {
    @StateObject private var viewModel = TemplateViewModel()
    @State private var showEditor = false
    @State private var editingTemplate: TemplateEntity?
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(viewModel.templates) { template in
                    VStack(alignment: .leading) {
                        Text(template.name ?? "Без названия")
                            .font(.headline)
                        Text("Правило: \(template.rules ?? "Нет")")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .onTapGesture {
                        editingTemplate = template
                        showEditor = true
                    }
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        viewModel.deleteTemplate(viewModel.templates[index])
                    }
                }
            }
            .navigationTitle("Шаблоны")
            .toolbar {
                Button {
                    editingTemplate = nil
                    showEditor = true
                } label: {
                    Image(systemName: "plus")
                }
            }
            .sheet(isPresented: $showEditor) {
                TemplateEditorView(template: editingTemplate)
            }
            .onAppear {
                viewModel.fetchTemplates()
            }
        }
    }
}
│   │   ├── TemplateEditorView.swift
│   │   ├── ExerciseEditorView.swift
│   │   ├── ProgressView.swift
│   │   └── Components/
│   │       └── StatCard.swift
│   ├── ViewModels/
│   │   ├── CalendarViewModel.swift
│   │   ├── TemplateViewModel.swift
import SwiftUI
import CoreData

class TemplateViewModel: ObservableObject {
    @Published var templates: [TemplateEntity] = []
    private let context = CoreDataManager.shared.viewContext
    
    func fetchTemplates() {
        let fetch: NSFetchRequest<TemplateEntity> = TemplateEntity.fetchRequest()
        templates = (try? context.fetch(fetch)) ?? []
    }
    
    func deleteTemplate(_ template: TemplateEntity) {
        context.delete(template)
        CoreDataManager.shared.save()
        fetchTemplates()
    }
}
│   │   └── PlayerViewModel.swift
│   └── Extensions/
│       └── DateExtensions.swift
└── README.md
WorkoutRPG.xcodeproj/project.pbxproj
