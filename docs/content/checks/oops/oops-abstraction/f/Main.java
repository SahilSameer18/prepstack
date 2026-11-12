interface Shape { double area(); }
class Square implements Shape {
    private final double side;
    Square(double side) { this.side = side; }
    public double area() { return side * side; }
}
class Rect implements Shape {
    private final double w, h;
    Rect(double w, double h) { this.w = w; this.h = h; }
    public double area() { return w * h; }
}
public class Main {
    public static void main(String[] args) {
        Shape[] all = { new Square(3), new Rect(2, 5) };
        for (Shape s : all) System.out.println(s.area());
    }
}
