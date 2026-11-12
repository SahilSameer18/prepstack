import java.util.*;
class Player { String name; Player(String n) { name = n; } }
class Team {                                   // aggregation: players are passed in
    List<Player> players = new ArrayList<>();  // one team, many players
    void add(Player p) { players.add(p); }
}
class Room { String label; Room(String l) { label = l; } }
class House {                                  // composition: the house makes its own rooms
    private List<Room> rooms = new ArrayList<>();
    House() { rooms.add(new Room("kitchen")); rooms.add(new Room("hall")); }
    int roomCount() { return rooms.size(); }
}
class Patient { String name; Patient(String n) { name = n; } }
class Doctor {
    Patient current;                           // association: kept as a field
    void see(Patient p) { current = p; }
    void treat(Patient p) { System.out.println("treating " + p.name); }  // dependency: only a parameter
}
class Vehicle { String move() { return "moves"; } }
class Car extends Vehicle { }                  // inheritance: a Car is a Vehicle
public class Main {
    public static void main(String[] args) {
        Player asha = new Player("Asha");
        Team t = new Team(); t.add(asha); t.add(new Player("Ravi"));
        t = null;                              // the team is gone
        System.out.println("player still here: " + asha.name);
        System.out.println("rooms inside a house: " + new House().roomCount());
        Doctor d = new Doctor();
        d.see(new Patient("Meena"));
        System.out.println("doctor keeps: " + d.current.name);
        d.treat(new Patient("Ravi"));
        System.out.println("doctor keeps after treat: " + d.current.name);
        Vehicle v = new Car();
        System.out.println("a " + v.getClass().getSimpleName() + " " + v.move());
    }
}
