import SwiftUI

// MARK: - ГЛАВНОЕ ПРИЛОЖЕНИЕ
@main
struct WorkoutApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
        }
    }
}

// MARK: - КОРНЕВОЙ ЭКРАН С ТАБАМИ
struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            DiaryView()
                .tabItem {
                    Label("Дневник", systemImage: "calendar")
                }
                .tag(0)
            
            ProfileView()
                .tabItem {
                    Label("Профиль", systemImage: "person")
                }
                .tag(1)
        }
        .accentColor(.green)
    }
}

// MARK: - ЭКРАН ДНЕВНИКА
struct DiaryView: View {
    @State private var selectedDate = Date()
    @State private var workouts: [Date] = []
    @State private var xp: Int = 0
    @State private var level: Int = 1
    @State private var streak: Int = 0
    @State private var totalWorkouts: Int = 0
    
    @State private var selectedPeriod: String = "Месяц"
    let periods = ["День", "Неделя", "Месяц", "Год"]
    
    let daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    let columns = Array(repeating: GridItem(.flexible()), count: 7)
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()
                
                VStack(spacing: 16) {
                    
                    // Верхняя панель с переключателями периодов
                    HStack(spacing: 8) {
                        ForEach(periods, id: \.self) { period in
                            Button(period) {
                                selectedPeriod = period
                            }
                            .font(.subheadline)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(selectedPeriod == period ? Color.green.opacity(0.3) : Color.clear)
                            .clipShape(Capsule())
                            .foregroundColor(selectedPeriod == period ? .green : .gray)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)
                    
                    // Заголовок с месяцем и годом
                    HStack {
                        Text(selectedDate.formatted(.dateTime.month(.wide).year()))
                            .font(.headline)
                            .foregroundColor(.white)
                        Spacer()
                        HStack(spacing: 16) {
                            Button("◀") {
                                selectedDate = Calendar.current.date(byAdding: .month, value: -1, to: selectedDate)!
                            }
                            .foregroundColor(.gray)
                            
                            Button("▶") {
                                selectedDate = Calendar.current.date(byAdding: .month, value: 1, to: selectedDate)!
                            }
                            .foregroundColor(.gray)
                        }
                    }
                    .padding(.horizontal)
                    
                    // Дни недели
                    LazyVGrid(columns: columns) {
                        ForEach(daysOfWeek, id: \.self) { day in
                            Text(day)
                                .font(.caption)
                                .foregroundColor(.gray)
                                .frame(maxWidth: .infinity)
                        }
                    }
                    
                    // Дни месяца
                    LazyVGrid(columns: columns) {
                        ForEach(getDaysInMonth(date: selectedDate), id: \.self) { date in
                            if let date = date {
                                let day = Calendar.current.component(.day, from: date)
                                let isWorkout = workouts.contains { Calendar.current.isDate($0, inSameDayAs: date) }
                                
                                Text("\(day)")
                                    .font(.subheadline)
                                    .frame(height: 36)
                                    .frame(maxWidth: .infinity)
                                    .background(isWorkout ? Color.green.opacity(0.6) : Color.clear)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                    .foregroundColor(isWorkout ? .black : .white)
                                    .onTapGesture {
                                        if !workouts.contains(where: { Calendar.current.isDate($0, inSameDayAs: date) }) {
                                            workouts.append(date)
                                            totalWorkouts += 1
                                            xp += 20
                                            if xp >= 100 {
                                                level += 1
                                                xp = 0
                                            }
                                            streak = calculateStreak()
                                        }
                                    }
                            } else {
                                Text("")
                                    .frame(height: 36)
                            }
                        }
                    }
                    .padding(.horizontal, 4)
                    
                    // Блок статистики (3 карточки)
                    HStack(spacing: 12) {
                        StatCard(value: "\(totalWorkouts)", label: "Активностей")
                        StatCard(value: "\(streak)", label: "Серия")
                        StatCard(value: "\(level)", label: "Уровень")
                    }
                    .padding(.horizontal)
                    
                    // Прогресс XP
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("XP")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Spacer()
                            Text("\(xp) / 100")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        ProgressView(value: Double(xp), total: 100)
                            .progressViewStyle(LinearProgressViewStyle(tint: .green))
                            .background(Color.gray.opacity(0.3))
                            .clipShape(RoundedRectangle(cornerRadius: 2))
                    }
                    .padding(.horizontal)
                    
                    // Кнопка сброса
                    Button("Сбросить прогресс") {
                        workouts.removeAll()
                        totalWorkouts = 0
                        xp = 0
                        level = 1
                        streak = 0
                    }
                    .font(.subheadline)
                    .foregroundColor(.red)
                    .padding(.top, 4)
                    
                    Spacer()
                }
                .padding(.vertical)
            }
            .navigationBarHidden(true)
        }
    }
    
    // MARK: - ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    func getDaysInMonth(date: Date) -> [Date?] {
        let calendar = Calendar.current
        guard let range = calendar.range(of: .day, in: .month, for: date),
              let firstDay = calendar.date(from: calendar.dateComponents([.year, .month], from: date)) else {
            return []
        }
        
        let firstWeekday = calendar.component(.weekday, from: firstDay)
        var days: [Date?] = Array(repeating: nil, count: firstWeekday - 2)
        
        for day in range {
            if let date = calendar.date(from: DateComponents(
                year: calendar.component(.year, from: date),
                month: calendar.component(.month, from: date),
                day: day
            )) {
                days.append(date)
            }
        }
        return days
    }
    
    func calculateStreak() -> Int {
        let sorted = workouts.sorted()
        var streak = 0
        var currentDay = Date()
        let calendar = Calendar.current
        
        while sorted.contains(where: { calendar.isDate($0, inSameDayAs: currentDay) }) {
            streak += 1
            currentDay = calendar.date(byAdding: .day, value: -1, to: currentDay)!
        }
        return streak
    }
}

// MARK: - ЭКРАН ПРОФИЛЯ
struct ProfileView: View {
    @State private var name: String = "Семечка"
    @State private var gender: String = "Мужской"
    @State private var age: String = "25"
    @State private var weight: String = "75"
    @State private var chest: String = ""
    @State private var biceps: String = ""
    @State private var thigh: String = ""
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()
                
                VStack(alignment: .leading, spacing: 20) {
                    Text("Данные")
                        .font(.title2.bold())
                        .foregroundColor(.white)
                        .padding(.top, 20)
                    
                    // Имя
                    VStack(alignment: .leading) {
                        Text("Имя")
                            .font(.caption)
                            .foregroundColor(.gray)
                        TextField("", text: $name)
                            .foregroundColor(.white)
                            .padding(8)
                            .background(Color.gray.opacity(0.2))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                    
                    // Пол
                    VStack(alignment: .leading) {
                        Text("Пол")
                            .font(.caption)
                            .foregroundColor(.gray)
                        TextField("", text: $gender)
                            .foregroundColor(.white)
                            .padding(8)
                            .background(Color.gray.opacity(0.2))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                    
                    // Возраст и Вес в одной строке
                    HStack(spacing: 16) {
                        VStack(alignment: .leading) {
                            Text("Возраст")
                                .font(.caption)
                                .foregroundColor(.gray)
                            TextField("", text: $age)
                                .keyboardType(.numberPad)
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Color.gray.opacity(0.2))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                        
                        VStack(alignment: .leading) {
                            Text("Вес (кг)")
                                .font(.caption)
                                .foregroundColor(.gray)
                            TextField("", text: $weight)
                                .keyboardType(.numberPad)
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Color.gray.opacity(0.2))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                    }
                    
                    // Замеры
                    Text("Замеры (см)")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.top, 8)
                    
                    HStack(spacing: 16) {
                        VStack(alignment: .leading) {
                            Text("Грудь")
                                .font(.caption)
                                .foregroundColor(.gray)
                            TextField("", text: $chest)
                                .keyboardType(.numberPad)
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Color.gray.opacity(0.2))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                        
                        VStack(alignment: .leading) {
                            Text("Бицепс")
                                .font(.caption)
                                .foregroundColor(.gray)
                            TextField("", text: $biceps)
                                .keyboardType(.numberPad)
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Color.gray.opacity(0.2))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                        
                        VStack(alignment: .leading) {
                            Text("Бедро")
                                .font(.caption)
                                .foregroundColor(.gray)
                            TextField("", text: $thigh)
                                .keyboardType(.numberPad)
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Color.gray.opacity(0.2))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                    }
                    
                    Button("Сохранять") {
                        // Логика сохранения (пока просто кнопка)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .foregroundColor(.black)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.top, 20)
                    
                    Spacer()
                }
                .padding(.horizontal)
            }
            .navigationBarHidden(true)
        }
    }
}

// MARK: - КОМПОНЕНТ СТАТИСТИКИ
struct StatCard: View {
    let value: String
    let label: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2.bold())
                .foregroundColor(.white)
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Color.gray.opacity(0.15))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
