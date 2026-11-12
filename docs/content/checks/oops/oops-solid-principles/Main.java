import java.util.List;

public class Main {
    // ---- S: single responsibility
    static class BadInvoice {
        double price = 100; int qty = 3;
        double total() { return price * qty; }
        String printText() { return "Invoice total: " + total(); } // two reasons to change
    }
    static class Invoice {
        final double price; final int qty;
        Invoice(double price, int qty) { this.price = price; this.qty = qty; }
        double total() { return price * qty; }
    }
    static class TextPrinter { String print(Invoice i) { return "Invoice total: " + i.total(); } }
    static class CsvPrinter { String print(Invoice i) { return "total," + i.total(); } }

    // ---- O: open-closed
    static double badArea(String kind, double a, double b) {
        if (kind.equals("rect")) return a * b;
        if (kind.equals("circle")) return 3.14 * a * a;
        return -1; // a new kind, e.g. "triangle", silently gives -1 until this method is edited
    }
    interface Shape { double area(); }
    record Rect(double w, double h) implements Shape { public double area() { return w * h; } }
    record Circle(double r) implements Shape { public double area() { return 3.14 * r * r; } }
    record Triangle(double b, double h) implements Shape { public double area() { return 0.5 * b * h; } }
    static double totalArea(List<Shape> shapes) {
        double sum = 0; for (Shape s : shapes) sum += s.area(); return sum;
    }

    // ---- L: Liskov substitution
    static class Rectangle {
        protected int width, height;
        void setWidth(int w) { width = w; }
        void setHeight(int h) { height = h; }
        int area() { return width * height; }
    }
    static class Square extends Rectangle {
        @Override void setWidth(int w) { width = w; height = w; }
        @Override void setHeight(int h) { width = h; height = h; }
    }
    static int resizeTo5by4(Rectangle r) { r.setWidth(5); r.setHeight(4); return r.area(); }

    // ---- I: interface segregation
    interface FatMachine { void print(String d); String scan(); }
    static class OldPrinter implements FatMachine {
        public void print(String d) { System.out.println("printing " + d); }
        public String scan() { throw new UnsupportedOperationException("no scanner"); }
    }
    interface Printer { void print(String d); }
    interface Scanner { String scan(); }
    static class SimplePrinter implements Printer { public void print(String d) { System.out.println("printing " + d); } }
    static class AllInOne implements Printer, Scanner {
        public void print(String d) { System.out.println("printing " + d); }
        public String scan() { return "scanned page"; }
    }

    // ---- D: dependency inversion
    static class EmailSender { void send(String m) { System.out.println("EMAIL: " + m); } }
    static class BadOrderService {
        private final EmailSender sender = new EmailSender(); // fixed to one concrete class
        void place(String item) { sender.send("Order placed: " + item); }
    }
    interface MessageSender { void send(String m); }
    static class OrderService {
        private final MessageSender sender;
        OrderService(MessageSender sender) { this.sender = sender; } // constructor injection
        void place(String item) { sender.send("Order placed: " + item); }
    }

    public static void main(String[] args) {
        System.out.println("S bad : " + new BadInvoice().printText());
        Invoice inv = new Invoice(100, 3);
        System.out.println("S good: " + new TextPrinter().print(inv) + " | " + new CsvPrinter().print(inv));

        System.out.println("O bad : triangle -> " + badArea("triangle", 4, 5));
        System.out.println("O good: " + totalArea(List.of(new Rect(2, 3), new Circle(1), new Triangle(4, 5))));

        System.out.println("L Rectangle: " + resizeTo5by4(new Rectangle()));
        System.out.println("L Square   : " + resizeTo5by4(new Square()));

        try { new OldPrinter().scan(); } catch (UnsupportedOperationException e) { System.out.println("I bad : " + e); }
        new SimplePrinter().print("page");
        System.out.println("I good: " + new AllInOne().scan());

        new BadOrderService().place("book");
        new OrderService(m -> System.out.println("FAKE : " + m)).place("book");
        new OrderService(new EmailSender()::send).place("book");
    }
}
