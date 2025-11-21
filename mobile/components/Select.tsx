import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, lineHeight } from '../constants';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onSelect: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onSelect,
  label,
  placeholder = 'Select an option',
  error,
  helperText,
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = !!error;

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  const renderOption = ({ item }: { item: SelectOption }) => {
    const isSelected = item.value === value;
    const isDisabled = item.disabled;

    return (
      <TouchableOpacity
        onPress={() => !isDisabled && handleSelect(item.value)}
        style={[
          styles.option,
          isSelected && styles.optionSelected,
          isDisabled && styles.optionDisabled,
        ]}
        disabled={isDisabled}
        accessibilityRole="menuitem"
        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      >
        <Text
          style={[
            styles.optionText,
            isSelected && styles.optionTextSelected,
            isDisabled && styles.optionTextDisabled,
          ]}
        >
          {item.label}
        </Text>
        {isSelected && (
          <Check size={20} color={colors.primary[500]} strokeWidth={2.5} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        style={[
          styles.trigger,
          hasError && styles.triggerError,
          disabled && styles.triggerDisabled,
        ]}
        disabled={disabled}
        accessibilityRole="combobox"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityState={{ expanded: isOpen, disabled }}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedOption && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown
          size={20}
          color={disabled ? colors.neutral[400] : colors.neutral[500]}
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdown}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>{label || 'Select'}</Text>
            </View>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing[2],
    letterSpacing: 0.025,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.default,
    backgroundColor: colors.white,
    minHeight: 48,
    paddingHorizontal: spacing[3],
  },
  triggerError: {
    borderColor: colors.error[500],
  },
  triggerDisabled: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
  },
  triggerText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  placeholderText: {
    color: colors.neutral[400],
  },
  disabledText: {
    color: colors.neutral[400],
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error[500],
    marginTop: spacing[1],
  },
  helperText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownHeader: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  optionDisabled: {
    backgroundColor: colors.neutral[50],
  },
  optionText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary[600],
    fontWeight: '500',
  },
  optionTextDisabled: {
    color: colors.neutral[400],
  },
});
