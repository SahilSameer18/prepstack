abstract class Shape {
    private final String name;
    Shape(String name) { this.name = name; }
    abstract double area();
    String describe() { return name + " with area " + area(); }
}
class Square extends Shape {
    private final double side;
    Square(double side) { super("Square"); this.side = side; }
    double area() { return side * side; }
}
public class Main {
    public static void main(String[] args) {
        Shape s = new Square(3);
        System.out.println(s.describe());
    }
}
