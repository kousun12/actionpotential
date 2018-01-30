class MovingVector {
 
  public PVector p;
  public PVector c;
  MovingVector(PVector vec) {
    c = vec;
  }
  
  public void update(PVector vec) {
    p = c.copy();
    c = vec.copy();
  }
}