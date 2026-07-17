📁 WorkoutRPG/
├── 📁 Models/
│   ├── CoreData.xcdatamodeld (это файл модели, отдельно)
│   └── CoreDataManager.swift
├── 📁 Views/
│   ├── ContentView.swift
│   ├── CalendarView.swift
│   ├── TemplateListView.swift
│   ├── TemplateEditorView.swift
│   ├── ExerciseEditorView.swift
│   ├── ProgressView.swift
│   └── Components/
│       ├── WorkoutButton.swift
│       └── StatCard.swift
├── 📁 ViewModels/
│   ├── CalendarViewModel.swift
│   ├── TemplateViewModel.swift
│   └── PlayerViewModel.swift
├── 📁 Extensions/
│   └── DateExtensions.swift
└── WorkoutRPGApp.swiftimport SwiftUI

@main
struct WorkoutRPGApp: App {
    let persistenceController = CoreDataManager.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.viewContext)
        }
    }
}import CoreData
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
}import SwiftUI

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
}import SwiftUI

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
}import SwiftUI
import CoreData

class CalendarViewModel: ObservableObject {
    @Published var totalWorkouts = 0
    @Published var streak = 0
    @Published var level = 1
    @Published var xp = 0
    
    private let context = CoreDataManager.shared.viewContext
    
    func loadData() {
        let fetch: NSFetchRequest<WorkoutLogEntity> = WorkoutLogEntity.fetchRequest()
        totalWorkouts = (try? context.count(for: fetch)) ?? 0
        
        // Рассчет серии
        streak = calculateStreak()
        
        // Получаем уровень из PlayerStats
        let statsFetch: NSFetchRequest<PlayerStatsEntity> = PlayerStatsEntity.fetchRequest()
        if let stats = try? context.fetch(statsFetch).first {
            level = Int(stats.level)
        }
    }
    
    func hasWorkout(on date: Date) -> Bool {
        let calendar = Calendar.current
        let start = calendar.startOfDay(for: date)
        let end = calendar.date(byAdding: .day, value: 1, to: start)!
        
        let fetch: NSFetchRequest<WorkoutLogEntity> = WorkoutLogEntity.fetchRequest()
        fetch.predicate = NSPredicate(format: "date >= %@ AND date < %@", start as NSDate, end as NSDate)
        
        return (try? context.count(for: fetch)) ?? 0 > 0
    }
    
    func markWorkout(on date: Date) {
        let log = WorkoutLogEntity(context: context)
        log.id = UUID()
        log.date = date
        
        // Добавляем XP
        addXP(20)
        
        CoreDataManager.shared.save()
        loadData()
    }
    
    private func addXP(_ amount: Int64) {
        let fetch: NSFetchRequest<PlayerStatsEntity> = PlayerStatsEntity.fetchRequest()
        if let stats = try? context.fetch(fetch).first {
            stats.currentXP += amount
            
            // Прокачка уровня
            while stats.currentXP >= stats.nextLevelXP {
                stats.level += 1
                stats.currentXP -= stats.nextLevelXP
                stats.nextLevelXP = Int64(Double(stats.nextLevelXP) * 1.5)
            }
        } else {
            // Создаем игрока
            let stats = PlayerStatsEntity(context: context)
            stats.level = 1
            stats.currentXP = amount
            stats.nextLevelXP = 100
        }
        CoreDataManager.shared.save()
    }
    
    private func calculateStreak() -> Int {
        var streakCount = 0
        let calendar = Calendar.current
        var date = calendar.startOfDay(for: Date())
        
        while hasWorkout(on: date) {
            streakCount += 1
            date = calendar.date(byAdding: .day, value: -1, to: date)!
        }
        return streakCount
    }
    
    func getDaysInMonth(date: Date) -> [Date?] {
        let calendar = Calendar.current
        let range = calendar.range(of: .day, in: .month, for: date)!
        let firstWeekday = calendar.component(.weekday, from: calendar.date(from: calendar.dateComponents([.year, .month], from: date))!)
        
        var days: [Date?] = Array(repeating: nil, count: firstWeekday - 2) // Для понедельника как первого дня
        
        for day in range {
            let date = calendar.date(from: DateComponents(year: calendar.component(.year, from: date),
                                                          month: calendar.component(.month, from: date),
                                                          day: day))!
            days.append(date)
        }
        return days
    }
}
import Foundation

extension Date {
    func startOfMonth() -> Date {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year, .month], from: self)
        return calendar.date(from: components)!
    }
    
    func daysInMonth() -> Int {
        let calendar = Calendar.current
        let range = calendar.range(of: .day, in: .month, for: self)!
        return range.count
    }
}
import SwiftUI

struct StatCard: View {
    let value: String
    let label: String
    
    var body: some View {
        VStack {
            Text(value)
                .font(.title2.bold())
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.gray.opacity(0.1)))
    }
}
import SwiftUI
import CoreData

class PlayerViewModel: ObservableObject {
    @Published var level = 1
    @Published var xp: Int64 = 0
    @Published var xpToNext: Int64 = 100
    @Published var totalWorkouts = 0
    @Published var streak = 0
    
    private let context = CoreDataManager.shared.viewContext
    
    func loadData() {
        let statsFetch: NSFetchRequest<PlayerStatsEntity> = PlayerStatsEntity.fetchRequest()
        if let stats = try? context.fetch(statsFetch).first {
            level = Int(stats.level)
            xp = stats.currentXP
            xpToNext = stats.nextLevelXP
        }
        
        let logFetch: NSFetchRequest<WorkoutLogEntity> = WorkoutLogEntity.fetchRequest()
        totalWorkouts = (try? context.count(for: logFetch)) ?? 0
        
        // Расчет серии
        streak = calculateStreak()
    }
    
    private func calculateStreak() -> Int {
        var count = 0
        let calendar = Calendar.current
        var date = calendar.startOfDay(for: Date())
        
        let fetch: NSFetchRequest<WorkoutLogEntity> = WorkoutLogEntity.fetchRequest()
        
        while true {
            let start = date
            let end = calendar.date(byAdding: .day, value: 1, to: start)!
            fetch.predicate = NSPredicate(format: "date >= %@ AND date < %@", start as NSDate, end as NSDate)
            
            if (try? context.count(for: fetch)) ?? 0 > 0 {
                count += 1
                date = calendar.date(byAdding: .day, value: -1, to: date)!
            } else {
                break
            }
        }
        return count
    }
}
import SwiftUI

struct ProgressView: View {
    @StateObject private var viewModel = PlayerViewModel()
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Уровень и XP
                VStack {
                    Text("Уровень \(viewModel.level)")
                        .font(.largeTitle.bold())
                    Text("XP: \(viewModel.xp) / \(viewModel.xpToNext)")
                        .font(.headline)
                    
                    ProgressView(value: Double(viewModel.xp), total: Double(viewModel.xpToNext))
                        .progressViewStyle(.linear)
                        .tint(.green)
                        .padding(.horizontal)
                }
                .padding()
                .background(RoundedRectangle(cornerRadius: 16).fill(Color.gray.opacity(0.1)))
                .padding()
                
                // Статистика
                HStack {
                    StatCard(value: "\(viewModel.totalWorkouts)", label: "Всего тренировок")
                    StatCard(value: "\(viewModel.streak)", label: "Серия дней")
                }
                
                Spacer()
            }
            .navigationTitle("Прогресс")
            .onAppear {
                viewModel.loadData()
            }
        }
    }
}
import SwiftUI

struct ExerciseEditorView: View {
    @Environment(\.dismiss) var dismiss
    let exercise: ExerciseEntity?
    
    @State private var name = ""
    @State private var metricType = "reps"
    @State private var targetValue = ""
    
    private let metricTypes = ["reps", "weight", "time", "distance"]
    private let context = CoreDataManager.shared.viewContext
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Название") {
                    TextField("Приседания", text: $name)
                }
                
                Section("Тип метрики") {
                    Picker("Тип", selection: $metricType) {
                        ForEach(metricTypes, id: \.self) { type in
                            Text(type.capitalized)
                        }
                    }
                    .pickerStyle(.segmented)
                }
                
                Section("Целевое значение") {
                    TextField("10", text: $targetValue)
                        .keyboardType(.decimalPad)
                }
            }
            .navigationTitle("Упражнение")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Сохранить") {
                        saveExercise()
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                loadData()
            }
        }
    }
    
    private func loadData() {
        if let exercise = exercise {
            name = exercise.name ?? ""
            metricType = exercise.metricType ?? "reps"
            targetValue = String(exercise.targetValue)
        }
    }
    
    private func saveExercise() {
        let exerciseToSave: ExerciseEntity
        if let exercise = exercise {
            exerciseToSave = exercise
        } else {
            exerciseToSave = ExerciseEntity(context: context)
            exerciseToSave.id = UUID()
        }
        
        exerciseToSave.name = name
        exerciseToSave.metricType = metricType
        exerciseToSave.targetValue = Double(targetValue) ?? 0
        
        CoreDataManager.shared.save()
        dismiss()
    }
}
import SwiftUI

struct TemplateEditorView: View {
    @Environment(\.dismiss) var dismiss
    let template: TemplateEntity?
    
    @State private var name = ""
    @State private var rules = ""
    @State private var exercises: [ExerciseEntity] = []
    @State private var showExerciseEditor = false
    @State private var editingExercise: ExerciseEntity?
    
    private let context = CoreDataManager.shared.viewContext
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Название") {
                    TextField("Например: Круговая", text: $name)
                }
                
                Section("Правило (дни недели)") {
                    TextField("2,4,6 (Вт, Чт, Сб)", text: $rules)
                        .keyboardType(.numbersAndPunctuation)
                }
                
                Section("Упражнения") {
                    ForEach(exercises, id: \.self) { exercise in
                        HStack {
                            Text(exercise.name ?? "Без названия")
                            Spacer()
                            Text("\(exercise.targetValue) \(exercise.metricType ?? "")")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        .onTapGesture {
                            editingExercise = exercise
                            showExerciseEditor = true
                        }
                    }
                    .onDelete { indexSet in
                        for index in indexSet {
                            context.delete(exercises[index])
                        }
                        exercises.remove(atOffsets: indexSet)
                    }
                    
                    Button("+ Добавить упражнение") {
                        editingExercise = nil
                        showExerciseEditor = true
                    }
                }
            }
            .navigationTitle(template == nil ? "Новый шаблон" : "Редактировать")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Сохранить") {
                        saveTemplate()
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showExerciseEditor) {
                ExerciseEditorView(exercise: editingExercise)
            }
            .onAppear {
                loadData()
            }
        }
    }
    
    private func loadData() {
        if let template = template {
            name = template.name ?? ""
            rules = template.rules ?? ""
            exercises = template.exercises?.allObjects as? [ExerciseEntity] ?? []
        }
    }
    
    private func saveTemplate() {
        let templateToSave: TemplateEntity
        if let template = template {
            templateToSave = template
        } else {
            templateToSave = TemplateEntity(context: context)
            templateToSave.id = UUID()
        }
        
        templateToSave.name = name
        templateToSave.rules = rules
        templateToSave.isActive = true
        
        CoreDataManager.shared.save()
        dismiss()
    }
}
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
14. 📁 Models / CoreData.xcdatamodeld (структура базы данных)
В Xcode создай файл CoreData.xcdatamodeld и добавь сущности с такими полями:

PlayerStatsEntity:

level: Int16

currentXP: Int64

nextLevelXP: Int64

TemplateEntity:

id: UUID

name: String

rules: String (например "2,4,6")

isActive: Bool

ExerciseEntity:

id: UUID

name: String

metricType: String ("reps", "weight", "time", "distance")

targetValue: Double

order: Int16

WorkoutLogEntity:

id: UUID

date: Date# WorkoutRPG
