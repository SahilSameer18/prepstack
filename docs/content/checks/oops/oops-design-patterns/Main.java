import java.io.*;
import java.lang.reflect.Constructor;
import java.util.*;
import java.util.function.Consumer;

public class Main {
    // ---- Singleton: unsafe lazy form
    static class LazyUnsafe {
        static int created = 0;
        private static LazyUnsafe instance;
        private LazyUnsafe() { created++; try { Thread.sleep(50); } catch (InterruptedException e) { } }
        static LazyUnsafe get() { if (instance == null) instance = new LazyUnsafe(); return instance; }
    }
    // safe: double-checked locking
    static class Checked {
        static int created = 0;
        private static volatile Checked instance;
        private Checked() { created++; try { Thread.sleep(50); } catch (InterruptedException e) { } }
        static Checked get() {
            if (instance == null) { synchronized (Checked.class) { if (instance == null) instance = new Checked(); } }
            return instance;
        }
    }
    // safe: holder idiom
    static class Holder {
        private Holder() { }
        private static class Box { static final Holder INSTANCE = new Holder(); }
        static Holder get() { return Box.INSTANCE; }
    }
    // safe: enum
    enum EnumSingleton { INSTANCE; int hits; }

    // ---- Factory Method
    interface Notification { String send(String m); }
    static class Email implements Notification { public String send(String m) { return "email: " + m; } }
    static class Sms implements Notification { public String send(String m) { return "sms: " + m; } }
    static abstract class Notifier {
        abstract Notification create();            // the factory method
        String notifyUser(String m) { return create().send(m); }
    }
    static class EmailNotifier extends Notifier { Notification create() { return new Email(); } }
    static class SmsNotifier extends Notifier { Notification create() { return new Sms(); } }

    // ---- Observer
    static class Channel {
        private final List<Consumer<String>> subscribers = new ArrayList<>();
        void subscribe(Consumer<String> s) { subscribers.add(s); }
        void upload(String title) { for (Consumer<String> s : subscribers) s.accept(title); }
    }

    // ---- Strategy
    interface Discount { double apply(double price); }

    // ---- Builder
    static class Pizza {
        private final String size; private final boolean cheese; private final boolean olives;
        private Pizza(Builder b) { size = b.size; cheese = b.cheese; olives = b.olives; }
        public String toString() { return size + " pizza, cheese=" + cheese + ", olives=" + olives; }
        static class Builder {
            private String size = "medium"; private boolean cheese, olives;
            Builder size(String s) { size = s; return this; }
            Builder cheese() { cheese = true; return this; }
            Builder olives() { olives = true; return this; }
            Pizza build() { return new Pizza(this); }
        }
    }

    // ---- Decorator
    interface Coffee { double cost(); String name(); }
    static class Plain implements Coffee { public double cost() { return 50; } public String name() { return "coffee"; } }
    static class Milk implements Coffee {
        private final Coffee inner; Milk(Coffee c) { inner = c; }
        public double cost() { return inner.cost() + 10; } public String name() { return inner.name() + " + milk"; }
    }
    static class Sugar implements Coffee {
        private final Coffee inner; Sugar(Coffee c) { inner = c; }
        public double cost() { return inner.cost() + 2; } public String name() { return inner.name() + " + sugar"; }
    }

    // ---- State
    interface DoorState { DoorState press(); String name(); }
    static class Closed implements DoorState { public DoorState press() { return new Open(); } public String name() { return "closed"; } }
    static class Open implements DoorState { public DoorState press() { return new Closed(); } public String name() { return "open"; } }
    static class Door {
        private DoorState state = new Closed();
        void press() { state = state.press(); }
        String show() { return state.name(); }
    }

    // ---- Adapter
    interface Celsius { double celsius(); }
    static class OldThermometer { double readFahrenheit() { return 98.6; } }
    static class ThermometerAdapter implements Celsius {
        private final OldThermometer old; ThermometerAdapter(OldThermometer o) { old = o; }
        public double celsius() { return (old.readFahrenheit() - 32) * 5 / 9; }
    }

    public static void main(String[] args) throws Exception {
        // Singleton race
        Thread[] ts = new Thread[4];
        for (int i = 0; i < ts.length; i++) { ts[i] = new Thread(LazyUnsafe::get); ts[i].start(); }
        for (Thread t : ts) t.join();
        System.out.println("Singleton lazy unsafe, instances created by 4 threads: " + LazyUnsafe.created);
        Thread[] us = new Thread[4];
        for (int i = 0; i < us.length; i++) { us[i] = new Thread(Checked::get); us[i].start(); }
        for (Thread t : us) t.join();
        System.out.println("Singleton double-checked, instances created by 4 threads: " + Checked.created);
        System.out.println("Singleton holder same object: " + (Holder.get() == Holder.get()));
        System.out.println("Singleton enum same object: " + (EnumSingleton.INSTANCE == EnumSingleton.valueOf("INSTANCE")));
        // Reflection
        Constructor<Holder> c = Holder.class.getDeclaredConstructor();
        c.setAccessible(true);
        System.out.println("Reflection on private constructor, second object? " + (c.newInstance() != Holder.get()));
        try {
            Constructor<EnumSingleton> ec = EnumSingleton.class.getDeclaredConstructor(String.class, int.class);
            ec.setAccessible(true);
            ec.newInstance("X", 1);
        } catch (Exception e) { System.out.println("Reflection on enum: " + e); }
        // Singleton is global state
        EnumSingleton.INSTANCE.hits++;
        System.out.println("Global state: hits seen by any code = " + EnumSingleton.INSTANCE.hits);

        System.out.println(new EmailNotifier().notifyUser("hi") + " | " + new SmsNotifier().notifyUser("hi"));

        Channel ch = new Channel();
        ch.subscribe(t -> System.out.println("Ann got: " + t));
        ch.subscribe(t -> System.out.println("Raj got: " + t));
        ch.upload("Video 1");

        Discount tenOff = p -> p * 0.9;
        Discount flat20 = p -> p - 20;
        System.out.println("Strategy: " + tenOff.apply(150) + " vs " + flat20.apply(150));
        List<String> words = new ArrayList<>(List.of("pear", "fig", "banana"));
        words.sort(Comparator.comparingInt(String::length));
        System.out.println("Comparator strategy by length: " + words);
        words.sort(Comparator.reverseOrder());
        System.out.println("Comparator strategy reverse: " + words);

        System.out.println(new Pizza.Builder().size("large").cheese().build());

        Coffee c1 = new Sugar(new Milk(new Plain()));
        System.out.println(c1.name() + " costs " + c1.cost());

        try (BufferedReader br = new BufferedReader(new StringReader("line one\nline two"))) {
            System.out.println("java.io decorator: " + br.readLine());
        }

        Door d = new Door();
        System.out.print("State: " + d.show());
        d.press(); System.out.print(" -> " + d.show());
        d.press(); System.out.println(" -> " + d.show());

        System.out.printf("Adapter: %.1f C%n", new ThermometerAdapter(new OldThermometer()).celsius());
    }
}
