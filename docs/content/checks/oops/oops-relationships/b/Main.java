class Rectangle {
    protected int w, h;
    Rectangle(int w, int h) { this.w = w; this.h = h; }
    void setWidth(int w) { this.w = w; }
    void setHeight(int h) { this.h = h; }
    int area() { return w * h; }
}
class Square extends Rectangle {
    Square(int s) { super(s, s); }
    @Override void setWidth(int w) { this.w = w; this.h = w; }
    @Override void setHeight(int h) { this.w = h; this.h = h; }
}
class Stretch { // code written for any Rectangle
    static int test(Rectangle r) { r.setWidth(5); r.setHeight(2); return r.area(); }
}
// composition fix: a SquareShape holds one side and offers only area()
class SquareShape {
    private final int side;
    SquareShape(int side) { this.side = side; }
    int area() { return side * side; }
}
public class Main {
    public static void main(String[] args) {
        System.out.println("Rectangle: " + Stretch.test(new Rectangle(1, 1)));
        System.out.println("Square as Rectangle: " + Stretch.test(new Square(1)));
        System.out.println("SquareShape(4): " + new SquareShape(4).area());
    }
}
