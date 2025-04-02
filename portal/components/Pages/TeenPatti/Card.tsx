import React from "react";
import styles from "./Card.module.css";

// Define the props type
interface CardProps {
  value: string; // Adjust the type if `value` is a number or a more complex type
}

const Card: React.FC<CardProps> = ({ value }) => {
  return <div className={styles.card}>{value}</div>;
};

export default Card;
