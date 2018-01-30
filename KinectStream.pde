import KinectPV2.KJoint;
import KinectPV2.*;  
import java.nio.FloatBuffer;


class KinectStream {
  KinectPV2 k;
  final float zVal = 300;
  final float rotX = PI;
  final int zScale = 4;
  HashMap<Integer, ArrayList<MovingVector>> joints = new HashMap();

  KinectStream(PApplet p) {
    k = new KinectPV2(p);
    k.enableBodyTrackImg(true);
    k.enableDepthMaskImg(true);
    k.enableSkeleton3DMap(true);
    k.init();
  }

  void drawDebugs() {
    image(k.getDepthMaskImage(), 0, 0, 320, 240);
    ArrayList<PImage> bodyTrackList = k.getBodyTrackUser();
    for (int i = 0; i < bodyTrackList.size(); i++) {
      PImage bodyTrackImg = (PImage)bodyTrackList.get(i);
      if (i <= 2)
        image(bodyTrackImg, 320 + 240*i, 0, 320, 240);
      else
        image(bodyTrackImg, 320 + 240*(i - 3), 424, 320, 240 );
    }
  }

  ArrayList<KJoint[]> allJoints() {
    ArrayList<KJoint[]> joints = new ArrayList();
    for (KSkeleton skeleton : k.getSkeleton3d()) {
      if (skeleton.isTracked()) {
        joints.add(skeleton.getJoints());
      }
    }
    return joints;
  }

  KJoint[] handJoints(KJoint[] joints) {
    return new KJoint[] {
      joints[KinectPV2.JointType_HandRight], 
      joints[KinectPV2.JointType_HandLeft]
    };
  }

  ArrayList<MovingVector> vectorsFor(int[] types) {
    ArrayList<KJoint[]> jointMatrix = allJoints();
    ArrayList<MovingVector> all = new ArrayList();
    for (int type : types) {
      if (joints.get(type) == null) {
        joints.put(type, new ArrayList());
      }
      ArrayList<MovingVector> list = joints.get(type);
      for (int i = 0; i<jointMatrix.size(); i++) {
        KJoint[] joints = jointMatrix.get(i);
        KJoint right = joints[type];
        try {
          list.get(i).update(right.getPosition().mult(zVal));
        } 
        catch (IndexOutOfBoundsException ie) {
          list.add(new MovingVector(right.getPosition().mult(zVal)));
        }
      }
      for(MovingVector i: list) {
        all.add(i);
      }
    }
    return all;
  }

  ArrayList<MovingVector> jointFor(int type) {
    ArrayList<KJoint[]> jointMatrix = allJoints();
    if (joints.get(type) == null) {
      joints.put(type, new ArrayList());
    }
    ArrayList<MovingVector> list = joints.get(type);
    for (int i = 0; i<jointMatrix.size(); i++) {
      KJoint[] joints = jointMatrix.get(i);
      KJoint right = joints[type];
      try {
        list.get(i).update(right.getPosition().mult(zVal));
      } 
      catch (IndexOutOfBoundsException ie) {
        list.add(new MovingVector(right.getPosition().mult(zVal)));
      }
    }
    return list;
  }

  //ArrayList<MovingVector> leftHands() {
  //  ArrayList<KJoint[]> jointMatrix = allJoints();
  //  for (int i = 0; i<jointMatrix.size(); i++) {
  //    KJoint[] joints = jointMatrix.get(i);
  //    KJoint right = joints[KinectPV2.JointType_HandLeft];
  //    try {
  //      lHands.get(i).update(right.getPosition().mult(zVal));
  //    } 
  //    catch (IndexOutOfBoundsException ie) {
  //      lHands.add(new MovingVector(right.getPosition().mult(zVal)));
  //    }
  //  }
  //  return lHands;
  //}

  //ArrayList<MovingVector> rightHands() {
  //  ArrayList<KJoint[]> jointMatrix = allJoints();
  //  for (int i = 0; i<jointMatrix.size(); i++) {
  //    KJoint[] joints = jointMatrix.get(i);
  //    KJoint right = joints[KinectPV2.JointType_HandRight];
  //    try {
  //      rHands.get(i).update(right.getPosition().mult(zVal));
  //    } 
  //    catch (IndexOutOfBoundsException ie) {
  //      rHands.add(new MovingVector(right.getPosition().mult(zVal)));
  //    }
  //  }
  //  return rHands;
  //}

  void drawSkels() {
    //translate the scene to the center 
    pushMatrix();
    translate(width/2, height/2, 0);
    //scale(zVal);
    rotateX(rotX);
    fill(30, 40, 30);
    stroke(30, 40, 30);
    for (KJoint[] joints : allJoints()) {
      //drawBody(joints);
      for (KJoint hand : handJoints(joints)) {
        drawHandState(hand);
      }
    }
    popMatrix();
  }

  void drawBody(KJoint[] joints) {
    drawBone(joints, KinectPV2.JointType_Head, KinectPV2.JointType_Neck);
    drawBone(joints, KinectPV2.JointType_Neck, KinectPV2.JointType_SpineShoulder);
    drawBone(joints, KinectPV2.JointType_SpineShoulder, KinectPV2.JointType_SpineMid);

    drawBone(joints, KinectPV2.JointType_SpineMid, KinectPV2.JointType_SpineBase);
    drawBone(joints, KinectPV2.JointType_SpineShoulder, KinectPV2.JointType_ShoulderRight);
    drawBone(joints, KinectPV2.JointType_SpineShoulder, KinectPV2.JointType_ShoulderLeft);
    drawBone(joints, KinectPV2.JointType_SpineBase, KinectPV2.JointType_HipRight);
    drawBone(joints, KinectPV2.JointType_SpineBase, KinectPV2.JointType_HipLeft);

    // Right Arm    
    drawBone(joints, KinectPV2.JointType_ShoulderRight, KinectPV2.JointType_ElbowRight);
    drawBone(joints, KinectPV2.JointType_ElbowRight, KinectPV2.JointType_WristRight);
    drawBone(joints, KinectPV2.JointType_WristRight, KinectPV2.JointType_HandRight);
    drawBone(joints, KinectPV2.JointType_HandRight, KinectPV2.JointType_HandTipRight);
    drawBone(joints, KinectPV2.JointType_WristRight, KinectPV2.JointType_ThumbRight);

    // Left Arm
    drawBone(joints, KinectPV2.JointType_ShoulderLeft, KinectPV2.JointType_ElbowLeft);
    drawBone(joints, KinectPV2.JointType_ElbowLeft, KinectPV2.JointType_WristLeft);
    drawBone(joints, KinectPV2.JointType_WristLeft, KinectPV2.JointType_HandLeft);
    drawBone(joints, KinectPV2.JointType_HandLeft, KinectPV2.JointType_HandTipLeft);
    drawBone(joints, KinectPV2.JointType_WristLeft, KinectPV2.JointType_ThumbLeft);

    // Right Leg
    drawBone(joints, KinectPV2.JointType_HipRight, KinectPV2.JointType_KneeRight);
    drawBone(joints, KinectPV2.JointType_KneeRight, KinectPV2.JointType_AnkleRight);
    drawBone(joints, KinectPV2.JointType_AnkleRight, KinectPV2.JointType_FootRight);

    // Left Leg
    drawBone(joints, KinectPV2.JointType_HipLeft, KinectPV2.JointType_KneeLeft);
    drawBone(joints, KinectPV2.JointType_KneeLeft, KinectPV2.JointType_AnkleLeft);
    drawBone(joints, KinectPV2.JointType_AnkleLeft, KinectPV2.JointType_FootLeft);

    drawJoint(joints, KinectPV2.JointType_HandTipLeft);
    drawJoint(joints, KinectPV2.JointType_HandTipRight);
    drawJoint(joints, KinectPV2.JointType_FootLeft);
    drawJoint(joints, KinectPV2.JointType_FootRight);

    drawJoint(joints, KinectPV2.JointType_ThumbLeft);
    drawJoint(joints, KinectPV2.JointType_ThumbRight);

    drawJoint(joints, KinectPV2.JointType_Head);
  }

  PVector posFor(KJoint joint) {
    return joint.getPosition();
  }

  void drawJoint(KJoint[] joints, int jointType) {
    PVector pos = posFor(joints[jointType]).mult(zVal);
    strokeWeight(2.0f + pos.z * zScale / zVal);
    point(pos.x, pos.y, pos.z);
  }

  void drawBone(KJoint[] joints, int jointType1, int jointType2) {
    PVector pos = posFor(joints[jointType2]).mult(zVal);
    strokeWeight(((2.0f + pos.z * zScale / zVal)));
    //line(x1, y1, x, y); 
    point(pos.x, pos.y, pos.z);
  }

  void drawHandState(KJoint joint) {
    handState(joint.getState());
    strokeWeight((5.0f + joint.getZ()*zScale));
    point(joint.getX() * zVal, joint.getY() * zVal, joint.getZ() * zVal);
  }

  void handState(int handState) {
    switch(handState) {
    case KinectPV2.HandState_Open:
      stroke(0, 255, 0);
      break;
    case KinectPV2.HandState_Closed:
      stroke(255, 0, 0);
      break;
    case KinectPV2.HandState_Lasso:
      stroke(0, 0, 255);
      break;
    case KinectPV2.HandState_NotTracked:
      stroke(100, 100, 100);
      break;
    }
  }
}