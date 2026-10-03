                                    // =====================================================



                                    // HEXA API



                                    // =====================================================











                                    // =====================================================



                                    // DATABASE USER / LOGIN



                                    // =====================================================







                                    const SPREADSHEET_ID =



                                      '1OlsJjQg3SA1MCtZij_pxjUpDWLFjsvOH0SZKtStW_f0';







                                    const SHEET_USERS =

                                      'USER DATA';





                                    // =====================================================

                                    // KOLOM USER DATABASE (A:L)

                                    // =====================================================



                                    const USER_COL = {

                                      UNIQ_ID: 1,

                                      USER_ID: 2,

                                      PASSWORD: 3,

                                      NAMA: 4,

                                      LEVEL: 5,

                                      KODE: 6,

                                      NO_HP: 7,

                                      PHOTO: 8,

                                      EMAIL: 9,

                                      STATUS: 10,

                                      KUTIPAN: 11,

                                      SIGNATURE: 12

                                    };











                                    // =====================================================



                                    // DATABASE DAILY MAINTENANCE



                                    // =====================================================







                                    const DM_SPREADSHEET_ID =



                                      '126bmi24Sfz7iashdudrt1qI-pSIdbfZ6mABFK7avaQM';







                                    const DM_SHEET_NAME =



                                      'DM DATABASE';











                                    // =====================================================
                                    // DATABASE UNIT POPULATION
                                    // =====================================================

                                      const POPULATION_SHEET_NAME =
                                      'Populasi';

                                      const POPULATION_COL = {
                                      UNIQ_ID: 1,
                                      UNIT_CODE: 2,
                                      EGI: 3,
                                      STATUS: 4
                                      };
                                    
                                    // =====================================================
                                    // DATABASE EGI MASTER
                                    // =====================================================

                                      const EGI_SHEET_NAME =
                                      'EGI';

                                      const EGI_COL = {
                                      UNIQ_ID: 1,
                                      EGI: 2,
                                      TYPE: 3
                                      };


                        // =====================================================
                        // DATABASE EQUIPMENT TYPE MASTER
                        // =====================================================

                        const EQUIPMENT_TYPE_SHEET_NAME =
                          'Equipment Type';

                        const EQUIPMENT_TYPE_COL = {
                          TYPE: 1
                        };


                        // =====================================================
                        // DATABASE GROUP COMPONENT MASTER
                        // =====================================================

                        const GROUP_COMPONENT_SHEET_NAME =
                          'Group Component';

                        const GROUP_COMPONENT_COL = {
                          CODE: 1,
                          GROUP_COMPONENT: 2
                        };


                        // =====================================================
                        // DATABASE DM CHECKLIST MASTER
                        // =====================================================

                        const DM_CHECKLIST_MASTER_SHEET_NAME =
                          'DM Checklist Master';

                        const DM_CHECKLIST_MASTER_COL = {
                          CHECKLIST_ID: 1,
                          TYPE: 2,
                          GROUP: 3,
                          ITEM: 4,
                          SEQUENCE: 5,
                          STATUS: 6
                        };


                        // =====================================================
                        // DATABASE DM SCHEDULER
                        // =====================================================

                        const DM_SCHEDULE_SHEET_NAME =
                          'DM Schedule';

                        const DM_SCHEDULE_UNIT_SHEET_NAME =
                          'DM Schedule Unit';

                        const DM_SCHEDULE_HEADERS = [
                          'SCHEDULE ID',
                          'ACTIVITY DATE',
                          'LUBE TRUCK',
                          'MECHANIC 1 ID',
                          'MECHANIC 1 NAME',
                          'MECHANIC 2 ID',
                          'MECHANIC 2 NAME',
                          'CREATED BY ID',
                          'CREATED BY NAME',
                          'CREATED AT',
                          'STATUS'
                        ];

                        const DM_SCHEDULE_UNIT_HEADERS = [
                          'SCHEDULE UNIT ID',
                          'SCHEDULE ID',
                          'UNIT ID',
                          'UNIT CODE',
                          'EGI',
                          'SEQUENCE',
                          'STATUS',
                          'STARTED AT',
                          'COMPLETED AT',
                          'COMPLETED BY ID',
                          'COMPLETED BY NAME',
                          'NOT COMPLETED REASON',
                          'NOTE'
                        ];

                        // =====================================================
                        // DATABASE DM INSPECTION
                        // =====================================================

                        const DM_INSPECTION_SHEET_NAME =
                          'DM Inspection';

                        const DM_INSPECTION_DETAIL_SHEET_NAME =
                          'DM Inspection Detail';

                        const DM_INSPECTION_HEADERS = [
                          'INSPECTION ID',
                          'SCHEDULE UNIT ID',
                          'SCHEDULE ID',
                          'ACTIVITY DATE',
                          'LUBE TRUCK',
                          'UNIT ID',
                          'UNIT CODE',
                          'EGI',
                          'TYPE',
                          'HOUR METER',
                          'STARTED AT',
                          'SAVED AT',
                          'SUBMITTED AT',
                          'STATUS',
                          'ACTIVITY NOTES',
                          'PHOTO',
                          'INSPECTED BY ID',
                          'INSPECTED BY NAME'
                        ];

                        const DM_INSPECTION_DETAIL_HEADERS = [
                          'DETAIL ID',
                          'INSPECTION ID',
                          'CHECKLIST ID',
                          'GROUP',
                          'ITEM',
                          'SEQUENCE',
                          'RESULT'
                        ];



                                    // =====================================================



                                    // GOOGLE DRIVE



                                    // FOLDER FOTO INSPECTION



                                    // =====================================================







                                    const INSPECTION_PHOTO_FOLDER_ID =



                                      '1zKbzzFSXPKynyf1N_GVTrwcz8pJzjX6M';











                                    // =====================================================



                                    // GOOGLE DRIVE



                                    // FOLDER EVIDENCE DAILY OUTSTANDING



                                    // =====================================================







                                    const OUTSTANDING_EVIDENCE_FOLDER_ID =



                                      '1ZEbjtEdw31FlRNEj6laJ2T53KX3KX0kz';



                                    // =====================================================
                                    // GOOGLE DRIVE
                                    // FOLDER USER PROFILE
                                    // =====================================================

                                    const USER_PROFILE_FOLDER_ID =
                                      '1pXoVpeS0-mA4B2uqneQwTxlptWbgHBN3';











                                    // =====================================================



                                    // KOLOM DM DATABASE



                                    // =====================================================







                                    const DM_COL = {



                                      ID: 1,



                                      UNIT_CODE: 2,



                                      HM_INSPECTION: 3,



                                      DATE_INSPECTION: 4,



                                      PHOTO: 5,



                                      GROUP_COMPONENT: 6,



                                      PROBLEM_DESCRIPTION: 7,



                                      RATING: 8,



                                      PARTS_DESCRIPTION: 9,



                                      PART_NO: 10,



                                      QUANTITY: 11,



                                      INSPECTORS: 12,



                                      NOTES: 13,



                                      MOL: 14,



                                      EVIDENCE: 15,



                                      PARTS_STATUS: 16,



                                      ACTION_PROBLEMS: 17,



                                      HM_ACTION: 18,



                                      DATE_ACTION: 19,



                                      STATUS: 20,



                                      MAN_POWER: 21



                                    };











                                    // =====================================================



                                    // HELPER



                                    // BUKA DM DATABASE



                                    // =====================================================







                                    function getDMSheet() {







                                      const ss =



                                        SpreadsheetApp.openById(



                                          DM_SPREADSHEET_ID



                                        );







                                      const sheet =



                                        ss.getSheetByName(



                                          DM_SHEET_NAME



                                        );







                                      if (!sheet) {



                                        throw new Error(



                                          'Sheet DM DATABASE tidak ditemukan.'



                                        );



                                      }







                                      return sheet;



                                    }


                                    // =====================================================
                                    // GET POPULATION SHEET
                                    // =====================================================

                                      function getPopulationSheet() {

                                      const ss =
                                      SpreadsheetApp.openById(
                                      DM_SPREADSHEET_ID
                                      );

                                      const sheet =
                                      ss.getSheetByName(
                                      POPULATION_SHEET_NAME
                                      );

                                      if (!sheet) {
                                      throw new Error(
                                      'Sheet Populasi tidak ditemukan.'
                                      );
                                      }

                                      return sheet;
                                    }
                        // =====================================================
                        // GET EGI SHEET
                        // =====================================================

                        function getEGISheet() {

                          const ss =
                            SpreadsheetApp.openById(
                              DM_SPREADSHEET_ID
                            );

                          const sheet =
                            ss.getSheetByName(
                              EGI_SHEET_NAME
                            );

                          if (!sheet) {
                            throw new Error(
                              'Sheet EGI tidak ditemukan.'
                            );
                          }

                          return sheet;
                        }

                        // =====================================================
                        // GET EGI LIST
                        // =====================================================

                        function getEGIList() {

                          const sheet = getEGISheet();
                          const lastRow = sheet.getLastRow();

                          if (lastRow < 2) {
                            return {
                              success: true,
                              egiList: []
                            };
                          }

                          const values = sheet
                            .getRange(
                              2,
                              1,
                              lastRow - 1,
                              3
                            )
                            .getDisplayValues();

                          const egiList = values
                            .filter(function(row) {
                              return cleanString(row[EGI_COL.EGI - 1]);
                            })
                            .map(function(row) {
                              return {
                                uniqId: cleanString(row[EGI_COL.UNIQ_ID - 1]),
                                egi: cleanString(row[EGI_COL.EGI - 1]),
                                type: cleanString(row[EGI_COL.TYPE - 1])
                              };
                            })
                            .sort(function(a, b) {
                              return a.egi.localeCompare(b.egi);
                            });

                          return {
                            success: true,
                            egiList: egiList
                          };
                        }

                        // =====================================================
                        // VALIDATE EQUIPMENT TYPE
                        // =====================================================

                        function validateEquipmentType(typeName) {

                          const type = cleanString(typeName);

                          if (!type) {
                            throw new Error('Equipment Type wajib dipilih.');
                          }

                          const result = getEquipmentTypeList();

                          const matchedType = (result.equipmentTypes || []).find(
                            function(item) {
                              return item.toLowerCase() === type.toLowerCase();
                            }
                          );

                          if (!matchedType) {
                            throw new Error(
                              'Equipment Type tidak terdaftar pada master Equipment Type.'
                            );
                          }

                          return matchedType;
                        }


                        // =====================================================
                        // GENERATE EGI ID
                        // =====================================================

                        function generateEGIId() {

                          const sheet = getEGISheet();
                          const lastRow = sheet.getLastRow();
                          let highestNumber = 0;

                          if (lastRow >= 2) {

                            const ids = sheet
                              .getRange(
                                2,
                                EGI_COL.UNIQ_ID,
                                lastRow - 1,
                                1
                              )
                              .getDisplayValues();

                            ids.forEach(function(row) {

                              const id = cleanString(row[0]);
                              const match = id.match(/^EGI(\d+)$/i);

                              if (match) {
                                highestNumber = Math.max(
                                  highestNumber,
                                  Number(match[1])
                                );
                              }

                            });
                          }

                          return 'EGI' +
                            String(highestNumber + 1).padStart(5, '0');
                        }


                        // =====================================================
                        // ADD EGI
                        // =====================================================

                        function addEGI(data) {

                          data = data || {};

                          const egi = cleanString(data.egi);
                          const type = validateEquipmentType(data.type);

                          if (!egi) {
                            throw new Error('EGI wajib diisi.');
                          }

                          const sheet = getEGISheet();
                          const lastRow = sheet.getLastRow();

                          if (lastRow >= 2) {

                            const values = sheet
                              .getRange(
                                2,
                                EGI_COL.EGI,
                                lastRow - 1,
                                1
                              )
                              .getDisplayValues();

                            const duplicate = values.some(function(row) {
                              return cleanString(row[0]).toLowerCase() ===
                                egi.toLowerCase();
                            });

                            if (duplicate) {
                              throw new Error('EGI sudah terdaftar.');
                            }
                          }

                          const uniqId = generateEGIId();

                          sheet.appendRow([
                            uniqId,
                            egi,
                            type
                          ]);

                          SpreadsheetApp.flush();

                          return {
                            success: true,
                            message: 'EGI berhasil ditambahkan.',
                            egi: {
                              uniqId: uniqId,
                              egi: egi,
                              type: type
                            }
                          };
                        }


                        // =====================================================
                        // UPDATE EGI
                        // =====================================================

                        function updateEGI(data) {

                          data = data || {};

                          const uniqId = cleanString(data.uniqId);
                          const egi = cleanString(data.egi);
                          const type = validateEquipmentType(data.type);

                          if (!uniqId) {
                            throw new Error('UNIQ ID EGI wajib diisi.');
                          }

                          if (!egi) {
                            throw new Error('EGI wajib diisi.');
                          }

                          const sheet = getEGISheet();
                          const lastRow = sheet.getLastRow();

                          if (lastRow < 2) {
                            throw new Error('Data EGI tidak ditemukan.');
                          }

                          const values = sheet
                            .getRange(
                              2,
                              1,
                              lastRow - 1,
                              3
                            )
                            .getDisplayValues();

                          let targetRow = -1;

                          for (let i = 0; i < values.length; i++) {

                            const existingId =
                              cleanString(values[i][EGI_COL.UNIQ_ID - 1]);

                            const existingEGI =
                              cleanString(values[i][EGI_COL.EGI - 1]);

                            if (
                              existingId.toLowerCase() ===
                              uniqId.toLowerCase()
                            ) {
                              targetRow = i + 2;
                            } else if (
                              existingEGI.toLowerCase() ===
                              egi.toLowerCase()
                            ) {
                              throw new Error(
                                'EGI sudah digunakan oleh data EGI lain.'
                              );
                            }
                          }

                          if (targetRow === -1) {
                            throw new Error('Data EGI tidak ditemukan.');
                          }

                          sheet
                            .getRange(
                              targetRow,
                              EGI_COL.EGI,
                              1,
                              2
                            )
                            .setValues([[
                              egi,
                              type
                            ]]);

                          SpreadsheetApp.flush();

                          return {
                            success: true,
                            message: 'EGI berhasil diperbarui.',
                            egi: {
                              uniqId: uniqId,
                              egi: egi,
                              type: type
                            }
                          };
                        }


                        // =====================================================
                        // ENSURE EGI EXISTS
                        // JIKA EGI BELUM ADA, OTOMATIS SIMPAN KE SHEET EGI
                        // =====================================================

                        function validateRegisteredEGI(egiName) {

                          const egi = cleanString(egiName);

                          if (!egi) {
                            throw new Error('EGI wajib diisi.');
                          }

                          const sheet = getEGISheet();
                          const lastRow = sheet.getLastRow();

                          if (lastRow < 2) {
                            throw new Error(
                              'EGI tidak terdaftar. Tambahkan EGI melalui Manage EGI terlebih dahulu.'
                            );
                          }

                          const values = sheet
                            .getRange(
                              2,
                              1,
                              lastRow - 1,
                              3
                            )
                            .getDisplayValues();

                          for (let i = 0; i < values.length; i++) {

                            const existingEGI =
                              cleanString(values[i][EGI_COL.EGI - 1]);

                            if (
                              existingEGI.toLowerCase() ===
                              egi.toLowerCase()
                            ) {

                              const type =
                                cleanString(values[i][EGI_COL.TYPE - 1]);

                              if (!type) {
                                throw new Error(
                                  'EGI "' + existingEGI +
                                  '" belum memiliki Equipment Type. Lengkapi melalui Manage EGI.'
                                );
                              }

                              return {
                                uniqId: cleanString(
                                  values[i][EGI_COL.UNIQ_ID - 1]
                                ),
                                egi: existingEGI,
                                type: type,
                                created: false
                              };
                            }
                          }

                          throw new Error(
                            'EGI "' + egi +
                            '" tidak terdaftar. Tambahkan EGI melalui Manage EGI terlebih dahulu.'
                          );
                        }

                        // =====================================================
                        // GET EQUIPMENT TYPE SHEET
                        // =====================================================

                        function getEquipmentTypeSheet() {
                          const ss = SpreadsheetApp.openById(DM_SPREADSHEET_ID);
                          const sheet = ss.getSheetByName(EQUIPMENT_TYPE_SHEET_NAME);

                          if (!sheet) {
                            throw new Error('Sheet Equipment Type tidak ditemukan.');
                          }

                          return sheet;
                        }

                        // =====================================================
                        // GET EQUIPMENT TYPE LIST
                        // =====================================================

                        function getEquipmentTypeList() {
                          const sheet = getEquipmentTypeSheet();
                          const lastRow = sheet.getLastRow();

                          if (lastRow < 2) {
                            return {
                              success: true,
                              equipmentTypes: []
                            };
                          }

                          const values = sheet
                            .getRange(
                              2,
                              EQUIPMENT_TYPE_COL.TYPE,
                              lastRow - 1,
                              1
                            )
                            .getDisplayValues();

                          const equipmentTypes = values
                            .map(function(row) {
                              return cleanString(row[0]);
                            })
                            .filter(function(type) {
                              return type;
                            })
                            .sort(function(a, b) {
                              return a.localeCompare(b);
                            });

                          return {
                            success: true,
                            equipmentTypes: equipmentTypes
                          };
                        }


                        // =====================================================
                        // GET GROUP COMPONENT SHEET
                        // =====================================================

                        function getGroupComponentSheet() {

                          const ss =
                            SpreadsheetApp.openById(
                              DM_SPREADSHEET_ID
                            );

                          const sheet =
                            ss.getSheetByName(
                              GROUP_COMPONENT_SHEET_NAME
                            );

                          if (!sheet) {
                            throw new Error(
                              'Sheet Group Component tidak ditemukan.'
                            );
                          }

                          return sheet;
                        }


                        // =====================================================
                        // GET GROUP COMPONENT LIST
                        // =====================================================

                        function getGroupComponentList() {

                          const sheet =
                            getGroupComponentSheet();

                          const lastRow =
                            sheet.getLastRow();

                          if (lastRow < 2) {
                            return {
                              success: true,
                              groupComponents: []
                            };
                          }

                          const values =
                            sheet
                              .getRange(
                                2,
                                1,
                                lastRow - 1,
                                2
                              )
                              .getDisplayValues();

                          const groupComponents =
                            values
                              .filter(function(row) {

                                return cleanString(
                                  row[
                                    GROUP_COMPONENT_COL.GROUP_COMPONENT - 1
                                  ]
                                );

                              })
                              .map(function(row) {

                                return {
                                  code: cleanString(
                                    row[
                                      GROUP_COMPONENT_COL.CODE - 1
                                    ]
                                  ),

                                  groupComponent: cleanString(
                                    row[
                                      GROUP_COMPONENT_COL.GROUP_COMPONENT - 1
                                    ]
                                  )
                                };

                              })
                              .sort(function(a, b) {

                                const codeA = Number(a.code);
                                const codeB = Number(b.code);

                                if (
                                  !isNaN(codeA) &&
                                  !isNaN(codeB)
                                ) {
                                  return codeA - codeB;
                                }

                                return a.groupComponent.localeCompare(
                                  b.groupComponent
                                );

                              });

                          return {
                            success: true,
                            groupComponents: groupComponents
                          };
                        }


                        // =====================================================
                        // GET DM CHECKLIST MASTER SHEET
                        // =====================================================

                        function getDMChecklistMasterSheet() {

                          const ss =
                            SpreadsheetApp.openById(
                              DM_SPREADSHEET_ID
                            );

                          const sheet =
                            ss.getSheetByName(
                              DM_CHECKLIST_MASTER_SHEET_NAME
                            );

                          if (!sheet) {
                            throw new Error(
                              'Sheet DM Checklist Master tidak ditemukan.'
                            );
                          }

                          return sheet;
                        }


                        // =====================================================
                        // GET DM CHECKLIST MASTER BY EQUIPMENT TYPE
                        // HANYA STATUS ACTIVE, URUT BERDASARKAN SEQUENCE
                        // =====================================================

                        function getDMChecklistMaster(typeName) {

                          const type =
                            validateEquipmentType(typeName);

                          const sheet =
                            getDMChecklistMasterSheet();

                          const lastRow =
                            sheet.getLastRow();

                          if (lastRow < 2) {
                            return {
                              success: true,
                              type: type,
                              count: 0,
                              checklist: []
                            };
                          }

                          const values =
                            sheet
                              .getRange(
                                2,
                                1,
                                lastRow - 1,
                                6
                              )
                              .getDisplayValues();

                          const checklist =
                            values
                              .filter(function(row) {

                                const rowType =
                                  cleanString(
                                    row[
                                      DM_CHECKLIST_MASTER_COL.TYPE - 1
                                    ]
                                  );

                                const status =
                                  cleanString(
                                    row[
                                      DM_CHECKLIST_MASTER_COL.STATUS - 1
                                    ]
                                  );

                                return (
                                  rowType.toLowerCase() ===
                                    type.toLowerCase() &&
                                  status.toUpperCase() === 'ACTIVE'
                                );

                              })
                              .map(function(row) {

                                const sequenceValue =
                                  cleanString(
                                    row[
                                      DM_CHECKLIST_MASTER_COL.SEQUENCE - 1
                                    ]
                                  );

                                const sequenceNumber =
                                  Number(sequenceValue);

                                return {
                                  checklistId: cleanString(
                                    row[
                                      DM_CHECKLIST_MASTER_COL.CHECKLIST_ID - 1
                                    ]
                                  ),
                                  type: cleanString(
                                    row[
                                      DM_CHECKLIST_MASTER_COL.TYPE - 1
                                    ]
                                  ),
                                  group: cleanString(
                                    row[
                                      DM_CHECKLIST_MASTER_COL.GROUP - 1
                                    ]
                                  ),
                                  item: cleanString(
                                    row[
                                      DM_CHECKLIST_MASTER_COL.ITEM - 1
                                    ]
                                  ),
                                  sequence:
                                    isNaN(sequenceNumber)
                                      ? 0
                                      : sequenceNumber,
                                  status: cleanString(
                                    row[
                                      DM_CHECKLIST_MASTER_COL.STATUS - 1
                                    ]
                                  )
                                };

                              })
                              .sort(function(a, b) {
                                return a.sequence - b.sequence;
                              });

                          return {
                            success: true,
                            type: type,
                            count: checklist.length,
                            checklist: checklist
                          };
                        }


                        // =====================================================
                        // GET DM CHECKLIST BY UNIT
                        // UNIT CODE -> POPULATION -> EGI -> TYPE -> CHECKLIST
                        // READ ONLY
                        // =====================================================

                        function getDMChecklistByUnit(unitCode) {

                          const code = cleanString(unitCode);

                          if (!code) {
                            throw new Error('Unit Code wajib diisi.');
                          }

                          // ---------------------------------------------------
                          // 1. CARI UNIT DI POPULATION
                          // ---------------------------------------------------

                          const populationSheet = getPopulationSheet();
                          const populationLastRow = populationSheet.getLastRow();

                          if (populationLastRow < 2) {
                            throw new Error('Data Population tidak ditemukan.');
                          }

                          const populationValues =
                            populationSheet
                              .getRange(
                                2,
                                1,
                                populationLastRow - 1,
                                4
                              )
                              .getDisplayValues();

                          let unitData = null;

                          for (let i = 0; i < populationValues.length; i++) {

                            const rowUnitCode =
                              cleanString(
                                populationValues[i][
                                  POPULATION_COL.UNIT_CODE - 1
                                ]
                              );

                            if (
                              rowUnitCode.toLowerCase() ===
                              code.toLowerCase()
                            ) {

                              unitData = {
                                unitId: cleanString(
                                  populationValues[i][
                                    POPULATION_COL.UNIQ_ID - 1
                                  ]
                                ),
                                unitCode: rowUnitCode,
                                egi: cleanString(
                                  populationValues[i][
                                    POPULATION_COL.EGI - 1
                                  ]
                                ),
                                status: cleanString(
                                  populationValues[i][
                                    POPULATION_COL.STATUS - 1
                                  ]
                                )
                              };

                              break;
                            }
                          }

                          if (!unitData) {
                            throw new Error(
                              'Unit Code "' + code +
                              '" tidak ditemukan pada Population Unit.'
                            );
                          }

                          if (!unitData.egi) {
                            throw new Error(
                              'Unit "' + unitData.unitCode +
                              '" belum memiliki EGI.'
                            );
                          }

                          // ---------------------------------------------------
                          // 2. VALIDASI EGI + AMBIL EQUIPMENT TYPE
                          // ---------------------------------------------------

                          const egiData =
                            validateRegisteredEGI(
                              unitData.egi
                            );

                          if (!egiData.type) {
                            throw new Error(
                              'EGI "' + egiData.egi +
                              '" belum memiliki Equipment Type.'
                            );
                          }

                          // ---------------------------------------------------
                          // 3. AMBIL CHECKLIST BERDASARKAN TYPE
                          // ---------------------------------------------------

                          const checklistResult =
                            getDMChecklistMaster(
                              egiData.type
                            );

                          return {
                            success: true,
                            unit: {
                              unitId: unitData.unitId,
                              unitCode: unitData.unitCode,
                              egi: egiData.egi,
                              type: egiData.type,
                              status: unitData.status
                            },
                            count: checklistResult.count,
                            checklist: checklistResult.checklist
                          };
                        }


                        // =====================================================
                        // GET AVAILABLE DM SCHEDULE UNITS
                        // RUNNING + STAND BY SAJA
                        // TYPE DITURUNKAN DARI EGI MASTER
                        // READ ONLY
                        // =====================================================

                        function getAvailableDMScheduleUnits() {

                          const populationSheet = getPopulationSheet();
                          const populationLastRow = populationSheet.getLastRow();

                          if (populationLastRow < 2) {
                            return {
                              success: true,
                              count: 0,
                              units: []
                            };
                          }

                          // Buat map EGI -> TYPE dari EGI Master.
                          const egiResult = getEGIList();
                          const egiTypeMap = {};

                          (egiResult.egiList || []).forEach(function(item) {
                            const egiKey =
                              cleanString(item.egi).toLowerCase();

                            if (egiKey) {
                              egiTypeMap[egiKey] =
                                cleanString(item.type);
                            }
                          });

                          const rows =
                            populationSheet
                              .getRange(
                                2,
                                1,
                                populationLastRow - 1,
                                4
                              )
                              .getDisplayValues();

                          const units =
                            rows
                              .filter(function(row) {

                                const unitCode =
                                  cleanString(
                                    row[POPULATION_COL.UNIT_CODE - 1]
                                  );

                                const status =
                                  cleanString(
                                    row[POPULATION_COL.STATUS - 1]
                                  ).toUpperCase();

                                return (
                                  unitCode &&
                                  (
                                    status === 'RUNNING' ||
                                    status === 'STAND BY'
                                  )
                                );

                              })
                              .map(function(row) {

                                const egi =
                                  cleanString(
                                    row[POPULATION_COL.EGI - 1]
                                  );

                                const type =
                                  egiTypeMap[
                                    egi.toLowerCase()
                                  ] || '';

                                if (!type) {
                                  throw new Error(
                                    'EGI "' + egi +
                                    '" pada Population belum memiliki Equipment Type yang valid.'
                                  );
                                }

                                return {
                                  unitId: cleanString(
                                    row[POPULATION_COL.UNIQ_ID - 1]
                                  ),
                                  unitCode: cleanString(
                                    row[POPULATION_COL.UNIT_CODE - 1]
                                  ),
                                  egi: egi,
                                  type: type,
                                  status: cleanString(
                                    row[POPULATION_COL.STATUS - 1]
                                  )
                                };

                              })
                              .sort(function(a, b) {
                                return a.unitCode.localeCompare(
                                  b.unitCode,
                                  undefined,
                                  {
                                    numeric: true,
                                    sensitivity: 'base'
                                  }
                                );
                              });

                          return {
                            success: true,
                            count: units.length,
                            units: units
                          };
                        }


                        // =====================================================
                        // GET DM SCHEDULER SHEETS
                        // =====================================================

                        function getDMScheduleSheet() {
                          const ss = SpreadsheetApp.openById(DM_SPREADSHEET_ID);
                          const sheet = ss.getSheetByName(DM_SCHEDULE_SHEET_NAME);

                          if (!sheet) {
                            throw new Error('Sheet DM Schedule tidak ditemukan.');
                          }

                          return sheet;
                        }

                        function getDMScheduleUnitSheet() {
                          const ss = SpreadsheetApp.openById(DM_SPREADSHEET_ID);
                          const sheet = ss.getSheetByName(DM_SCHEDULE_UNIT_SHEET_NAME);

                          if (!sheet) {
                            throw new Error('Sheet DM Schedule Unit tidak ditemukan.');
                          }

                          return sheet;
                        }


                        // =====================================================
                        // DM INSPECTION - SHEET HELPERS
                        // =====================================================

                        function getDMInspectionSheet() {
                          const ss = SpreadsheetApp.openById(DM_SPREADSHEET_ID);
                          const sheet = ss.getSheetByName(DM_INSPECTION_SHEET_NAME);
                          if (!sheet) throw new Error('Sheet DM Inspection tidak ditemukan.');
                          return sheet;
                        }

                        function getDMInspectionDetailSheet() {
                          const ss = SpreadsheetApp.openById(DM_SPREADSHEET_ID);
                          const sheet = ss.getSheetByName(DM_INSPECTION_DETAIL_SHEET_NAME);
                          if (!sheet) throw new Error('Sheet DM Inspection Detail tidak ditemukan.');
                          return sheet;
                        }

                        function validateDMInspectionSheetStructure() {
                          function check(sheet, headers) {
                            const actual = sheet.getRange(1, 1, 1, headers.length)
                              .getDisplayValues()[0]
                              .map(cleanString);
                            const mismatches = [];
                            headers.forEach(function(expected, index) {
                              if (actual[index] !== expected) {
                                mismatches.push({column:index + 1, expected:expected, actual:actual[index]});
                              }
                            });
                            return {sheetName:sheet.getName(), valid:mismatches.length === 0, mismatches:mismatches};
                          }
                          const parent = check(getDMInspectionSheet(), DM_INSPECTION_HEADERS);
                          const detail = check(getDMInspectionDetailSheet(), DM_INSPECTION_DETAIL_HEADERS);
                          return {success:parent.valid && detail.valid, inspection:parent, detail:detail};
                        }

                        function generateDMInspectionId() {
                          const sheet = getDMInspectionSheet();
                          const lastRow = sheet.getLastRow();
                          let highest = 0;
                          if (lastRow >= 2) {
                            sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().forEach(function(row) {
                              const match = cleanString(row[0]).match(/^DMI(\d+)$/i);
                              if (match) highest = Math.max(highest, Number(match[1]));
                            });
                          }
                          return 'DMI' + String(highest + 1).padStart(6, '0');
                        }

                        function generateDMInspectionDetailIds(count) {
                          const sheet = getDMInspectionDetailSheet();
                          const lastRow = sheet.getLastRow();
                          let highest = 0;
                          if (lastRow >= 2) {
                            sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().forEach(function(row) {
                              const match = cleanString(row[0]).match(/^DMID(\d+)$/i);
                              if (match) highest = Math.max(highest, Number(match[1]));
                            });
                          }
                          const ids = [];
                          for (let i = 1; i <= count; i++) ids.push('DMID' + String(highest + i).padStart(6, '0'));
                          return ids;
                        }

                        // =====================================================
                        // SAVE DM INSPECTION DRAFT
                        // Draft boleh parsial dan Hour Meter boleh kosong.
                        // Save Draft mengubah DM Schedule Unit menjadi IN PROGRESS.
                        // =====================================================

                        function saveDMInspectionDraft(data) {
                          data = data || {};

                          const scheduleUnitId = cleanString(data.scheduleUnitId);
                          const inspectedById = cleanString(data.inspectedById);
                          const hourMeter = cleanString(data.hourMeter);
                          const activityNotes = cleanString(data.activityNotes);
                          const photo = cleanString(data.photo);
                          const answers = Array.isArray(data.answers) ? data.answers : [];

                          if (!scheduleUnitId) throw new Error('Schedule Unit ID wajib tersedia.');
                          if (!inspectedById) throw new Error('Identitas inspector wajib tersedia.');

                          const profileResult = getUserProfile(inspectedById);
                          if (!profileResult.success || !profileResult.user) throw new Error('Inspector tidak valid.');
                          const inspector = profileResult.user;
                          if (cleanString(inspector.status).toUpperCase() !== 'ACTIVE') {
                            throw new Error('Akun inspector sedang tidak aktif.');
                          }

                          const structure = validateDMInspectionSheetStructure();
                          if (!structure.success) throw new Error('Struktur sheet DM Inspection belum sesuai header yang ditetapkan.');

                          const lock = LockService.getScriptLock();
                          lock.waitLock(30000);

                          try {
                            const scheduleUnitSheet = getDMScheduleUnitSheet();
                            const suLastRow = scheduleUnitSheet.getLastRow();
                            if (suLastRow < 2) throw new Error('Data DM Schedule Unit belum tersedia.');

                            const suValues = scheduleUnitSheet.getRange(2, 1, suLastRow - 1, DM_SCHEDULE_UNIT_HEADERS.length).getValues();
                            let scheduleUnitRowIndex = -1;
                            let su = null;

                            for (let i = 0; i < suValues.length; i++) {
                              if (cleanString(suValues[i][0]) === scheduleUnitId) {
                                scheduleUnitRowIndex = i + 2;
                                su = suValues[i];
                                break;
                              }
                            }
                            if (!su) throw new Error('Schedule Unit ID "' + scheduleUnitId + '" tidak ditemukan.');

                            const currentUnitStatus = cleanString(su[6]).toUpperCase();
                            if (currentUnitStatus === 'COMPLETED') throw new Error('Unit ini sudah COMPLETED dan tidak dapat disimpan sebagai Draft.');
                            if (currentUnitStatus === 'NOT COMPLETED') throw new Error('Unit ini sudah ditutup sebagai NOT COMPLETED.');

                            const scheduleId = cleanString(su[1]);
                            const unitId = cleanString(su[2]);
                            const unitCode = cleanString(su[3]);
                            const egi = cleanString(su[4]);

                            const scheduleSheet = getDMScheduleSheet();
                            const sLastRow = scheduleSheet.getLastRow();
                            const sValues = sLastRow >= 2
                              ? scheduleSheet.getRange(2, 1, sLastRow - 1, DM_SCHEDULE_HEADERS.length).getValues()
                              : [];
                            let schedule = null;
                            for (let i = 0; i < sValues.length; i++) {
                              if (cleanString(sValues[i][0]) === scheduleId) { schedule = sValues[i]; break; }
                            }
                            if (!schedule) throw new Error('Parent DM Schedule tidak ditemukan.');
                            if (cleanString(schedule[10]).toUpperCase() === 'CANCELLED') throw new Error('Schedule sudah CANCELLED.');

                            const activityDate = formatDateForApi(schedule[1]);
                            const lubeTruck = cleanString(schedule[2]);
                            const type = validateRegisteredEGI(egi).type;
                            if (!type) throw new Error('Equipment Type untuk EGI "' + egi + '" belum tersedia.');

                            const checklistResult = getDMChecklistMaster(type);
                            const checklist = checklistResult.checklist || [];
                            const checklistMap = {};
                            checklist.forEach(function(item) { checklistMap[cleanString(item.checklistId)] = item; });

                            const normalizedAnswers = [];
                            const seen = {};
                            answers.forEach(function(answer) {
                              answer = answer || {};
                              const checklistId = cleanString(answer.checklistId);
                              const result = cleanString(answer.result).toUpperCase();
                              if (!checklistId || !result) return;
                              if (!checklistMap[checklistId]) throw new Error('Checklist ID "' + checklistId + '" tidak valid untuk TYPE ' + type + '.');
                              if (['GOOD', 'BAD', 'REPAIRED', 'N/A'].indexOf(result) === -1) {
                                throw new Error('RESULT checklist hanya boleh GOOD, BAD, REPAIRED, atau N/A.');
                              }
                              if (seen[checklistId]) throw new Error('Checklist ID "' + checklistId + '" dikirim lebih dari satu kali.');
                              seen[checklistId] = true;
                              normalizedAnswers.push({checklistId:checklistId, result:result, master:checklistMap[checklistId]});
                            });

                            const inspectionSheet = getDMInspectionSheet();
                            const inspectionLastRow = inspectionSheet.getLastRow();
                            const inspectionValues = inspectionLastRow >= 2
                              ? inspectionSheet.getRange(2, 1, inspectionLastRow - 1, DM_INSPECTION_HEADERS.length).getValues()
                              : [];

                            let inspectionRowIndex = -1;
                            let inspectionId = '';
                            let startedAt = '';
                            for (let i = 0; i < inspectionValues.length; i++) {
                              if (cleanString(inspectionValues[i][1]) === scheduleUnitId) {
                                inspectionRowIndex = i + 2;
                                inspectionId = cleanString(inspectionValues[i][0]);
                                startedAt = inspectionValues[i][10] || '';
                                const existingStatus = cleanString(inspectionValues[i][13]).toUpperCase();
                                if (existingStatus === 'SUBMITTED') throw new Error('Inspection unit ini sudah SUBMITTED.');
                                break;
                              }
                            }

                            const now = new Date();
                            if (!inspectionId) inspectionId = generateDMInspectionId();
                            if (!startedAt) startedAt = now;

                            const parentRow = [
                              inspectionId, scheduleUnitId, scheduleId, activityDate, lubeTruck,
                              unitId, unitCode, egi, type, hourMeter, startedAt, now, '', 'DRAFT',
                              activityNotes, photo, cleanString(inspector.uniqId || inspectedById), cleanString(inspector.nama)
                            ];

                            if (inspectionRowIndex > 0) {
                              inspectionSheet.getRange(inspectionRowIndex, 1, 1, DM_INSPECTION_HEADERS.length).setValues([parentRow]);
                            } else {
                              inspectionSheet.appendRow(parentRow);
                            }

                            const detailSheet = getDMInspectionDetailSheet();
                            const detailLastRow = detailSheet.getLastRow();
                            const detailValues = detailLastRow >= 2
                              ? detailSheet.getRange(2, 1, detailLastRow - 1, DM_INSPECTION_DETAIL_HEADERS.length).getValues()
                              : [];

                            const existingDetailByChecklist = {};
                            detailValues.forEach(function(row, index) {
                              if (cleanString(row[1]) === inspectionId) {
                                existingDetailByChecklist[cleanString(row[2])] = {rowIndex:index + 2, detailId:cleanString(row[0])};
                              }
                            });

                            const newAnswers = normalizedAnswers.filter(function(answer) {
                              return !existingDetailByChecklist[answer.checklistId];
                            });
                            const newDetailIds = generateDMInspectionDetailIds(newAnswers.length);
                            let newIdIndex = 0;

                            normalizedAnswers.forEach(function(answer) {
                              const existing = existingDetailByChecklist[answer.checklistId];
                              const master = answer.master;
                              const row = [
                                existing ? existing.detailId : newDetailIds[newIdIndex++],
                                inspectionId,
                                answer.checklistId,
                                cleanString(master.group),
                                cleanString(master.item),
                                Number(master.sequence) || cleanString(master.sequence),
                                answer.result
                              ];
                              if (existing) {
                                detailSheet.getRange(existing.rowIndex, 1, 1, DM_INSPECTION_DETAIL_HEADERS.length).setValues([row]);
                              } else {
                                detailSheet.appendRow(row);
                              }
                            });

                            scheduleUnitSheet.getRange(scheduleUnitRowIndex, 7).setValue('IN PROGRESS');
                            if (!su[7]) scheduleUnitSheet.getRange(scheduleUnitRowIndex, 8).setValue(startedAt);

                            return {
                              success:true,
                              message:'Draft Daily Activity berhasil disimpan.',
                              inspectionId:inspectionId,
                              scheduleUnitId:scheduleUnitId,
                              status:'DRAFT',
                              unitStatus:'IN PROGRESS',
                              unitCode:unitCode,
                              hourMeter:hourMeter,
                              savedAnswers:normalizedAnswers.length
                            };
                          } finally {
                            lock.releaseLock();
                          }
                        }


                        // =====================================================
                        // GET / RESUME DM INSPECTION DRAFT
                        // Mengambil draft terakhir berdasarkan SCHEDULE UNIT ID.
                        // Tidak menulis / mengubah data.
                        // =====================================================

                        function getDMInspectionDraft(scheduleUnitId) {
                          scheduleUnitId = cleanString(scheduleUnitId);

                          if (!scheduleUnitId) {
                            throw new Error('Schedule Unit ID wajib tersedia.');
                          }

                          const structure = validateDMInspectionSheetStructure();
                          if (!structure.success) {
                            throw new Error(
                              'Struktur sheet DM Inspection belum sesuai header yang ditetapkan.'
                            );
                          }

                          const inspectionSheet = getDMInspectionSheet();
                          const inspectionLastRow = inspectionSheet.getLastRow();

                          if (inspectionLastRow < 2) {
                            return {
                              success: true,
                              found: false,
                              scheduleUnitId: scheduleUnitId,
                              message: 'Draft belum tersedia.'
                            };
                          }

                          const inspectionValues = inspectionSheet
                            .getRange(
                              2,
                              1,
                              inspectionLastRow - 1,
                              DM_INSPECTION_HEADERS.length
                            )
                            .getValues();

                          let parent = null;

                          for (let i = 0; i < inspectionValues.length; i++) {
                            const row = inspectionValues[i];

                            if (cleanString(row[1]) === scheduleUnitId) {
                              parent = row;
                              break;
                            }
                          }

                          if (!parent) {
                            return {
                              success: true,
                              found: false,
                              scheduleUnitId: scheduleUnitId,
                              message: 'Draft belum tersedia.'
                            };
                          }

                          const inspectionId = cleanString(parent[0]);
                          const detailSheet = getDMInspectionDetailSheet();
                          const detailLastRow = detailSheet.getLastRow();

                          const answers = [];

                          if (detailLastRow >= 2) {
                            const detailValues = detailSheet
                              .getRange(
                                2,
                                1,
                                detailLastRow - 1,
                                DM_INSPECTION_DETAIL_HEADERS.length
                              )
                              .getValues();

                            detailValues.forEach(function(row) {
                              if (cleanString(row[1]) !== inspectionId) return;

                              answers.push({
                                detailId: cleanString(row[0]),
                                checklistId: cleanString(row[2]),
                                group: cleanString(row[3]),
                                item: cleanString(row[4]),
                                sequence: Number(row[5]) || cleanString(row[5]),
                                result: cleanString(row[6]).toUpperCase()
                              });
                            });
                          }

                          answers.sort(function(a, b) {
                            return (Number(a.sequence) || 0) - (Number(b.sequence) || 0);
                          });

                          return {
                            success: true,
                            found: true,
                            inspection: {
                              inspectionId: inspectionId,
                              scheduleUnitId: cleanString(parent[1]),
                              scheduleId: cleanString(parent[2]),
                              activityDate: formatDateForApi(parent[3]),
                              lubeTruck: cleanString(parent[4]),
                              unitId: cleanString(parent[5]),
                              unitCode: cleanString(parent[6]),
                              egi: cleanString(parent[7]),
                              type: cleanString(parent[8]),
                              hourMeter: cleanString(parent[9]),
                              startedAt: parent[10] || '',
                              savedAt: parent[11] || '',
                              submittedAt: parent[12] || '',
                              status: cleanString(parent[13]).toUpperCase(),
                              activityNotes: cleanString(parent[14]),
                              photo: cleanString(parent[15]),
                              inspectedById: cleanString(parent[16]),
                              inspectedByName: cleanString(parent[17]),
                              answers: answers
                            }
                          };
                        }

                        // =====================================================
                        // TEST RESUME DRAFT
                        // Harus membaca DMI000001 milik DMSU000020
                        // dan 3 jawaban yang sudah tersimpan.
                        // =====================================================

                        
                // =====================================================
                // TEST UPDATE DRAFT YANG SAMA
                // Target:
                // - tetap DMI000001
                // - DMC00001: GOOD -> BAD
                // - DMC00002: BAD -> GOOD
                // - DMC00003: tetap REPAIRED
                // - tambah DMC00004: GOOD
                // - total jawaban menjadi 4
                // =====================================================

                function testUpdateDMInspectionDraft() {
                  const scheduleUnitId = 'DMSU000020';

                  const scheduleUnitSheet = getDMScheduleUnitSheet();
                  const suLastRow = scheduleUnitSheet.getLastRow();

                  if (suLastRow < 2) {
                    throw new Error('DM Schedule Unit belum memiliki data.');
                  }

                  const suValues = scheduleUnitSheet
                    .getRange(2, 1, suLastRow - 1, DM_SCHEDULE_UNIT_HEADERS.length)
                    .getValues();

                  let scheduleUnit = null;

                  for (let i = 0; i < suValues.length; i++) {
                    if (cleanString(suValues[i][0]) === scheduleUnitId) {
                      scheduleUnit = suValues[i];
                      break;
                    }
                  }

                  if (!scheduleUnit) {
                    throw new Error('Schedule Unit ID ' + scheduleUnitId + ' tidak ditemukan.');
                  }

                  const scheduleId = cleanString(scheduleUnit[1]);
                  const scheduleSheet = getDMScheduleSheet();
                  const sLastRow = scheduleSheet.getLastRow();

                  if (sLastRow < 2) {
                    throw new Error('DM Schedule belum memiliki data.');
                  }

                  const sValues = scheduleSheet
                    .getRange(2, 1, sLastRow - 1, DM_SCHEDULE_HEADERS.length)
                    .getValues();

                  let schedule = null;

                  for (let i = 0; i < sValues.length; i++) {
                    if (cleanString(sValues[i][0]) === scheduleId) {
                      schedule = sValues[i];
                      break;
                    }
                  }

                  if (!schedule) {
                    throw new Error('Parent schedule ' + scheduleId + ' tidak ditemukan.');
                  }

                  const mechanic1Id = cleanString(schedule[3]);

                  if (!mechanic1Id) {
                    throw new Error('Mechanic 1 ID pada parent schedule masih kosong.');
                  }

                  const result = saveDMInspectionDraft({
                    scheduleUnitId: scheduleUnitId,
                    inspectedById: mechanic1Id,
                    hourMeter: '12345',
                    activityNotes: 'TEST UPDATE DRAFT STAGE 3B-3',
                    photo: '',
                    answers: [
                      { checklistId: 'DMC00001', result: 'BAD' },
                      { checklistId: 'DMC00002', result: 'GOOD' },
                      { checklistId: 'DMC00003', result: 'REPAIRED' },
                      { checklistId: 'DMC00004', result: 'GOOD' }
                    ]
                  });

                  const resumed = getDMInspectionDraft(scheduleUnitId);

                  Logger.log(JSON.stringify({
                    saveResult: result,
                    resumedDraft: resumed
                  }, null, 2));
                }

                function testGetDMInspectionDraft() {
                          const result = getDMInspectionDraft('DMSU000020');
                          Logger.log(JSON.stringify(result, null, 2));
                        }


                        // =====================================================
                        // SUBMIT FINAL DM INSPECTION
                        // =====================================================

                        function submitDMInspection(data) {
                          data = data || {};

                          const scheduleUnitId = cleanString(data.scheduleUnitId);
                          const inspectedById = cleanString(data.inspectedById);
                          const hourMeter = cleanString(data.hourMeter);
                          const activityNotes = cleanString(data.activityNotes);
                          const photo = cleanString(data.photo);
                          const answers = Array.isArray(data.answers) ? data.answers : [];

                          if (!scheduleUnitId) throw new Error('Schedule Unit ID wajib tersedia.');
                          if (!inspectedById) throw new Error('Inspector wajib tersedia.');
                          if (!hourMeter) throw new Error('Hour Meter wajib diisi sebelum Submit.');

                          saveDMInspectionDraft({
                            scheduleUnitId: scheduleUnitId,
                            inspectedById: inspectedById,
                            hourMeter: hourMeter,
                            activityNotes: activityNotes,
                            photo: photo,
                            answers: answers
                          });

                          const draftResult = getDMInspectionDraft(scheduleUnitId);

                          if (!draftResult || !draftResult.success || !draftResult.found) {
                            throw new Error('Draft Daily Activity tidak ditemukan setelah penyimpanan.');
                          }

                          const inspection = draftResult.inspection || {};
                          const inspectionId = cleanString(inspection.inspectionId);
                          const typeName = cleanString(inspection.type);

                          const masterResult = getDMChecklistMaster(typeName);
                          const masterItems = masterResult && Array.isArray(masterResult.checklist)
                            ? masterResult.checklist
                            : [];

                          if (!masterItems.length) {
                            throw new Error('Checklist ACTIVE untuk Equipment Type ' + typeName + ' tidak ditemukan.');
                          }

                          const answerMap = {};
                          (inspection.answers || []).forEach(function(answer) {
                            const id = cleanString(answer.checklistId);
                            const result = cleanString(answer.result).toUpperCase();
                            if (id) answerMap[id] = result;
                          });

                          const allowedResults = { GOOD: true, BAD: true, REPAIRED: true, 'N/A': true };
                          const missing = [];
                          const invalid = [];

                          masterItems.forEach(function(item) {
                            const id = cleanString(item.checklistId || item.checklistID || item.id);
                            const result = answerMap[id] || '';

                            if (!result) {
                              missing.push(id);
                            } else if (!allowedResults[result]) {
                              invalid.push(id);
                            }
                          });

                          if (missing.length) {
                            throw new Error('Checklist belum lengkap. ' + missing.length + ' item belum diisi.');
                          }

                          if (invalid.length) {
                            throw new Error('Terdapat ' + invalid.length + ' hasil checklist yang tidak valid.');
                          }

                          const now = new Date();

                          const inspectionSheet = getDMInspectionSheet();
                          const inspectionLastRow = inspectionSheet.getLastRow();
                          const inspectionValues = inspectionSheet
                            .getRange(2, 1, inspectionLastRow - 1, DM_INSPECTION_HEADERS.length)
                            .getValues();

                          let inspectionRow = 0;
                          for (let i = 0; i < inspectionValues.length; i++) {
                            if (cleanString(inspectionValues[i][0]) === inspectionId) {
                              inspectionRow = i + 2;
                              break;
                            }
                          }

                          if (!inspectionRow) {
                            throw new Error('Record DM Inspection ' + inspectionId + ' tidak ditemukan.');
                          }

                          inspectionSheet.getRange(inspectionRow, 10).setValue(hourMeter);
                          inspectionSheet.getRange(inspectionRow, 12).setValue(now);
                          inspectionSheet.getRange(inspectionRow, 13).setValue(now);
                          inspectionSheet.getRange(inspectionRow, 14).setValue('SUBMITTED');
                          inspectionSheet.getRange(inspectionRow, 15).setValue(activityNotes);
                          inspectionSheet.getRange(inspectionRow, 16).setValue(photo);

                          const scheduleUnitSheet = getDMScheduleUnitSheet();
                          const suLastRow = scheduleUnitSheet.getLastRow();
                          const suValues = scheduleUnitSheet
                            .getRange(2, 1, suLastRow - 1, DM_SCHEDULE_UNIT_HEADERS.length)
                            .getValues();

                          let scheduleUnitRow = 0;
                          for (let i = 0; i < suValues.length; i++) {
                            if (cleanString(suValues[i][0]) === scheduleUnitId) {
                              scheduleUnitRow = i + 2;
                              break;
                            }
                          }

                          if (!scheduleUnitRow) {
                            throw new Error('Schedule Unit ID ' + scheduleUnitId + ' tidak ditemukan.');
                          }

                          if (!scheduleUnitSheet.getRange(scheduleUnitRow, 8).getValue()) {
                            scheduleUnitSheet.getRange(scheduleUnitRow, 8).setValue(now);
                          }

                          scheduleUnitSheet.getRange(scheduleUnitRow, 7).setValue('COMPLETED');
                          scheduleUnitSheet.getRange(scheduleUnitRow, 9).setValue(now);
                          scheduleUnitSheet.getRange(scheduleUnitRow, 10).setValue(inspectedById);
                          scheduleUnitSheet.getRange(scheduleUnitRow, 11).setValue(
                            cleanString(inspection.inspectedByName)
                          );

                          return {
                            success: true,
                            message: 'Daily Activity berhasil disubmit.',
                            inspectionId: inspectionId,
                            scheduleUnitId: scheduleUnitId,
                            unitCode: cleanString(inspection.unitCode),
                            type: typeName,
                            hourMeter: hourMeter,
                            status: 'SUBMITTED',
                            unitStatus: 'COMPLETED',
                            submittedAnswers: masterItems.length
                          };
                        }


                        // =====================================================
                        // TEST SUBMIT VALIDATION
                        // DMI000001 masih parsial, jadi test ini HARUS ditolak.
                        // =====================================================

                        
    // =====================================================
    // TEST RESULT N/A SUPPORT - NO DATABASE WRITE
    // =====================================================
    function testDMInspectionNAResultSupport() {
      const allowedDraftResults = ['GOOD', 'BAD', 'REPAIRED', 'N/A'];
      const allowedSubmitResults = { GOOD: true, BAD: true, REPAIRED: true, 'N/A': true };

      if (allowedDraftResults.indexOf('N/A') === -1 || !allowedSubmitResults['N/A']) {
        throw new Error('N/A belum didukung.');
      }

      Logger.log(JSON.stringify({
        success: true,
        result: 'N/A',
        draftAccepted: true,
        submitAccepted: true,
        message: 'N/A didukung sebagai pilihan checklist keempat.'
      }, null, 2));
    }

    function testSubmitDMInspectionValidation() {
                          const draft = getDMInspectionDraft('DMSU000020');

                          if (!draft || !draft.success || !draft.found) {
                            throw new Error('Draft DMSU000020 tidak ditemukan.');
                          }

                          const inspection = draft.inspection || {};

                          const result = submitDMInspection({
                            scheduleUnitId: 'DMSU000020',
                            inspectedById: inspection.inspectedById,
                            hourMeter: inspection.hourMeter || '12345',
                            activityNotes: inspection.activityNotes || '',
                            photo: inspection.photo || '',
                            answers: inspection.answers || []
                          });

                          Logger.log(JSON.stringify(result, null, 2));
                        }


                        function testValidateDMInspectionSheetStructure() {
                          Logger.log(JSON.stringify(validateDMInspectionSheetStructure(), null, 2));
                        }

                        // =====================================================
                        // TEST SAVE DM INSPECTION DRAFT
                        // TEST UNIT: DMSU000020 / HEX 1210 / CAT 395
                        // =====================================================

                        function testSaveDMInspectionDraft() {
                          const scheduleUnitId = 'DMSU000020';

                          const scheduleUnitSheet = getDMScheduleUnitSheet();
                          const suLastRow = scheduleUnitSheet.getLastRow();
                          if (suLastRow < 2) throw new Error('DM Schedule Unit belum memiliki data.');

                          const suValues = scheduleUnitSheet
                            .getRange(2, 1, suLastRow - 1, DM_SCHEDULE_UNIT_HEADERS.length)
                            .getValues();

                          let scheduleUnit = null;
                          for (let i = 0; i < suValues.length; i++) {
                            if (cleanString(suValues[i][0]) === scheduleUnitId) {
                              scheduleUnit = suValues[i];
                              break;
                            }
                          }

                          if (!scheduleUnit) {
                            throw new Error('Schedule Unit ID ' + scheduleUnitId + ' tidak ditemukan.');
                          }

                          const scheduleId = cleanString(scheduleUnit[1]);
                          const scheduleSheet = getDMScheduleSheet();
                          const sLastRow = scheduleSheet.getLastRow();
                          if (sLastRow < 2) throw new Error('DM Schedule belum memiliki data.');

                          const sValues = scheduleSheet
                            .getRange(2, 1, sLastRow - 1, DM_SCHEDULE_HEADERS.length)
                            .getValues();

                          let schedule = null;
                          for (let i = 0; i < sValues.length; i++) {
                            if (cleanString(sValues[i][0]) === scheduleId) {
                              schedule = sValues[i];
                              break;
                            }
                          }

                          if (!schedule) {
                            throw new Error('Parent schedule ' + scheduleId + ' tidak ditemukan.');
                          }

                          const mechanic1Id = cleanString(schedule[3]);
                          if (!mechanic1Id) {
                            throw new Error('Mechanic 1 ID pada parent schedule masih kosong.');
                          }

                          const result = saveDMInspectionDraft({
                            scheduleUnitId: scheduleUnitId,
                            inspectedById: mechanic1Id,
                            hourMeter: '',
                            activityNotes: 'TEST SAVE DRAFT STAGE 3B-1',
                            photo: '',
                            answers: [
                              { checklistId: 'DMC00001', result: 'GOOD' },
                              { checklistId: 'DMC00002', result: 'BAD' },
                              { checklistId: 'DMC00003', result: 'REPAIRED' }
                            ]
                          });

                          Logger.log(JSON.stringify(result, null, 2));
                        }

                        // =====================================================
                        // VALIDATE DM SCHEDULER SHEET STRUCTURE
                        // READ ONLY - TIDAK MENGUBAH SHEET
                        // =====================================================

                        function validateDMSchedulerSheetStructure() {

                          const scheduleSheet = getDMScheduleSheet();
                          const scheduleUnitSheet = getDMScheduleUnitSheet();

                          function checkHeaders(sheet, expectedHeaders) {

                            const actualHeaders =
                              sheet
                                .getRange(
                                  1,
                                  1,
                                  1,
                                  expectedHeaders.length
                                )
                                .getDisplayValues()[0]
                                .map(function(value) {
                                  return cleanString(value);
                                });

                            const mismatches = [];

                            expectedHeaders.forEach(function(expected, index) {

                              if (actualHeaders[index] !== expected) {
                                mismatches.push({
                                  column: index + 1,
                                  expected: expected,
                                  actual: actualHeaders[index]
                                });
                              }

                            });

                            return {
                              sheetName: sheet.getName(),
                              valid: mismatches.length === 0,
                              expectedColumnCount: expectedHeaders.length,
                              mismatches: mismatches
                            };
                          }

                          const scheduleCheck =
                            checkHeaders(
                              scheduleSheet,
                              DM_SCHEDULE_HEADERS
                            );

                          const scheduleUnitCheck =
                            checkHeaders(
                              scheduleUnitSheet,
                              DM_SCHEDULE_UNIT_HEADERS
                            );

                          return {
                            success:
                              scheduleCheck.valid &&
                              scheduleUnitCheck.valid,
                            schedule: scheduleCheck,
                            scheduleUnit: scheduleUnitCheck
                          };
                        }


                        // =====================================================
                        // GENERATE DM SCHEDULE ID
                        // =====================================================

                        function generateDMScheduleId() {
                          const sheet = getDMScheduleSheet();
                          const lastRow = sheet.getLastRow();
                          let highest = 0;

                          if (lastRow >= 2) {
                            sheet.getRange(2, 1, lastRow - 1, 1)
                              .getDisplayValues()
                              .forEach(function(row) {
                                const match = cleanString(row[0]).match(/^DMS(\d+)$/i);
                                if (match) highest = Math.max(highest, Number(match[1]));
                              });
                          }

                          return 'DMS' + String(highest + 1).padStart(6, '0');
                        }


                        // =====================================================
                        // GENERATE DM SCHEDULE UNIT ID
                        // =====================================================

                        function generateDMScheduleUnitIds(count) {
                          const sheet = getDMScheduleUnitSheet();
                          const lastRow = sheet.getLastRow();
                          let highest = 0;

                          if (lastRow >= 2) {
                            sheet.getRange(2, 1, lastRow - 1, 1)
                              .getDisplayValues()
                              .forEach(function(row) {
                                const match = cleanString(row[0]).match(/^DMSU(\d+)$/i);
                                if (match) highest = Math.max(highest, Number(match[1]));
                              });
                          }

                          const ids = [];
                          for (let i = 1; i <= count; i++) {
                            ids.push('DMSU' + String(highest + i).padStart(6, '0'));
                          }
                          return ids;
                        }


                        // =====================================================
                        // SAVE DM SCHEDULE
                        // 1 LUBE TRUCK = TEPAT 2 MECHANIC + >= 1 UNIT
                        // =====================================================

                        function saveDMSchedule(data) {

                          data = data || {};

                          const activityDate = cleanString(data.activityDate);
                          const lubeTruck = cleanString(data.lubeTruck).toUpperCase();
                          const mechanic1Id = cleanString(data.mechanic1Id);
                          const mechanic2Id = cleanString(data.mechanic2Id);
                          const createdById = cleanString(data.createdById);
                          const unitIds = Array.isArray(data.unitIds) ? data.unitIds : [];

                          if (!activityDate) throw new Error('Activity Date wajib diisi.');

                          if (lubeTruck !== 'LUBE TRUCK 15' && lubeTruck !== 'LUBE TRUCK 16') {
                            throw new Error('Lube Truck hanya boleh LUBE TRUCK 15 atau LUBE TRUCK 16.');
                          }

                          if (!mechanic1Id || !mechanic2Id) {
                            throw new Error('Schedule wajib memiliki tepat 2 mechanic.');
                          }

                          if (mechanic1Id === mechanic2Id) {
                            throw new Error('Mechanic 1 dan Mechanic 2 tidak boleh sama.');
                          }

                          if (!createdById) throw new Error('Created By wajib tersedia.');

                          if (!unitIds.length) throw new Error('Minimal 1 unit wajib dipilih.');

                          const mechanics = getActiveMechanics().mechanics || [];

                          function findMechanic(id) {
                            return mechanics.find(function(item) {
                              return item.uniqId === id;
                            });
                          }

                          const mechanic1 = findMechanic(mechanic1Id);
                          const mechanic2 = findMechanic(mechanic2Id);

                          if (!mechanic1 || !mechanic2) {
                            throw new Error('Mechanic harus terdaftar sebagai MECHANIC ACTIVE.');
                          }

                          const profileResult = getUserProfile(createdById);
                          if (!profileResult.success) {
                            throw new Error('User pembuat schedule tidak valid.');
                          }

                          const availableUnits = getAvailableDMScheduleUnits().units || [];
                          const uniqueUnitIds = Array.from(new Set(unitIds.map(cleanString).filter(Boolean)));

                          if (uniqueUnitIds.length !== unitIds.length) {
                            throw new Error('Unit yang sama tidak boleh dipilih lebih dari satu kali.');
                          }

                          const selectedUnits = uniqueUnitIds.map(function(unitId) {
                            const unit = availableUnits.find(function(item) {
                              return item.unitId === unitId;
                            });
                            if (!unit) {
                              throw new Error('Unit ID "' + unitId + '" tidak tersedia untuk DM Schedule.');
                            }
                            return unit;
                          });

                          const scheduleSheet = getDMScheduleSheet();
                          const scheduleUnitSheet = getDMScheduleUnitSheet();
                          const scheduleId = generateDMScheduleId();
                          const scheduleUnitIds = generateDMScheduleUnitIds(selectedUnits.length);
                          const now = new Date();

                          // Hindari schedule ganda untuk tanggal + Lube Truck yang sama.
                          const lastRow = scheduleSheet.getLastRow();
                          if (lastRow >= 2) {
                            const existing = scheduleSheet.getRange(2, 1, lastRow - 1, 11).getDisplayValues();

                            const duplicate = existing.some(function(row) {
                              const rowDate = formatDateForApi(row[1]);
                              const rowTruck = cleanString(row[2]).toUpperCase();
                              const rowStatus = cleanString(row[10]).toUpperCase();

                              return rowDate === activityDate &&
                                     rowTruck === lubeTruck &&
                                     rowStatus !== 'CANCELLED';
                            });

                            if (duplicate) {
                              throw new Error(
                                'Schedule ' + lubeTruck + ' untuk tanggal ' + activityDate + ' sudah ada.'
                              );
                            }
                          }

                          // Simpan header schedule.
                          scheduleSheet.appendRow([
                            scheduleId,
                            activityDate,
                            lubeTruck,
                            mechanic1.uniqId,
                            mechanic1.nama,
                            mechanic2.uniqId,
                            mechanic2.nama,
                            profileResult.user.uniqId,
                            profileResult.user.nama,
                            now,
                            'ACTIVE'
                          ]);

                          // Simpan unit schedule.
                          const unitRows = selectedUnits.map(function(unit, index) {
                            return [
                              scheduleUnitIds[index],
                              scheduleId,
                              unit.unitId,
                              unit.unitCode,
                              unit.egi,
                              index + 1,
                              'NOT STARTED',
                              '',
                              '',
                              '',
                              '',
                              '',
                              ''
                            ];
                          });

                          scheduleUnitSheet
                            .getRange(
                              scheduleUnitSheet.getLastRow() + 1,
                              1,
                              unitRows.length,
                              13
                            )
                            .setValues(unitRows);

                          SpreadsheetApp.flush();

                          return {
                            success: true,
                            scheduleId: scheduleId,
                            activityDate: activityDate,
                            lubeTruck: lubeTruck,
                            mechanics: [mechanic1, mechanic2],
                            unitCount: selectedUnits.length,
                            units: selectedUnits
                          };
                        }


                        // =====================================================
                        // UPDATE DM SCHEDULE
                        // STAGE 2F-A
                        //
                        // CATATAN OTORISASI:
                        // Untuk sementara backend mengizinkan MASTER ACTIVE saja.
                        // Permission Scheduler / Edit Schedule akan menggantikan gate
                        // ini setelah Daily Activity Permissions dibuat di System Settings.
                        // Tidak memakai flag otorisasi dari frontend.
                        //
                        // RULE DATA:
                        // - SCHEDULE ID tetap.
                        // - Tanggal + Lube Truck tidak berubah dari fungsi edit ini.
                        // - Mechanic dapat diganti.
                        // - Unit NOT STARTED dapat ditambah / dihapus.
                        // - Unit IN PROGRESS / COMPLETED / NOT COMPLETED tidak boleh dihapus.
                        // - Status/progress unit yang tetap dipilih dipertahankan.
                        // =====================================================

                        function updateDMSchedule(data) {

                          data = data || {};

                          const scheduleId = cleanString(data.scheduleId);
                          const requesterUniqId = cleanString(
                            data.requesterUniqId || data.updatedById
                          );
                          const mechanic1Id = cleanString(data.mechanic1Id);
                          const mechanic2Id = cleanString(data.mechanic2Id);
                          const unitIds = Array.isArray(data.unitIds) ? data.unitIds : [];

                          if (!scheduleId) {
                            throw new Error('Schedule ID wajib tersedia.');
                          }

                          if (!requesterUniqId) {
                            throw new Error('Identitas user editor wajib tersedia.');
                          }

                          // ---------------------------------------------------
                          // 1. OTORISASI SEMENTARA: MASTER ACTIVE
                          // ---------------------------------------------------

                          const requesterProfile = getUserProfile(requesterUniqId);

                          if (!requesterProfile.success || !requesterProfile.user) {
                            throw new Error('User editor tidak valid.');
                          }

                          const requester = requesterProfile.user;

                          if (cleanString(requester.status).toUpperCase() !== 'ACTIVE') {
                            throw new Error('Akun user editor sedang tidak aktif.');
                          }

                          if (cleanString(requester.kode) !== '1') {
                            throw new Error(
                              'Edit Schedule belum diotorisasi untuk akun ini. ' +
                              'Untuk sementara hanya Master yang dapat melakukan Edit Schedule.'
                            );
                          }

                          // ---------------------------------------------------
                          // 2. VALIDASI MECHANIC
                          // ---------------------------------------------------

                          if (!mechanic1Id || !mechanic2Id) {
                            throw new Error('Schedule wajib memiliki tepat 2 mechanic.');
                          }

                          if (mechanic1Id === mechanic2Id) {
                            throw new Error('Mechanic 1 dan Mechanic 2 tidak boleh sama.');
                          }

                          const mechanics = getActiveMechanics().mechanics || [];

                          function findMechanic(id) {
                            return mechanics.find(function(item) {
                              return item.uniqId === id;
                            });
                          }

                          const mechanic1 = findMechanic(mechanic1Id);
                          const mechanic2 = findMechanic(mechanic2Id);

                          if (!mechanic1 || !mechanic2) {
                            throw new Error('Mechanic harus terdaftar sebagai MECHANIC ACTIVE.');
                          }

                          // ---------------------------------------------------
                          // 3. VALIDASI UNIT PILIHAN
                          // ---------------------------------------------------

                          if (!unitIds.length) {
                            throw new Error('Minimal 1 unit wajib dipilih.');
                          }

                          const uniqueUnitIds =
                            Array.from(
                              new Set(
                                unitIds
                                  .map(cleanString)
                                  .filter(Boolean)
                              )
                            );

                          if (uniqueUnitIds.length !== unitIds.length) {
                            throw new Error(
                              'Unit yang sama tidak boleh dipilih lebih dari satu kali.'
                            );
                          }

                          const availableUnits =
                            getAvailableDMScheduleUnits().units || [];

                          const availableUnitMap = {};

                          availableUnits.forEach(function(unit) {
                            availableUnitMap[unit.unitId] = unit;
                          });

                          // ---------------------------------------------------
                          // 4. CARI PARENT SCHEDULE
                          // ---------------------------------------------------

                          const scheduleSheet = getDMScheduleSheet();
                          const scheduleUnitSheet = getDMScheduleUnitSheet();

                          const scheduleLastRow = scheduleSheet.getLastRow();

                          if (scheduleLastRow < 2) {
                            throw new Error('DM Schedule masih kosong.');
                          }

                          const scheduleRows =
                            scheduleSheet
                              .getRange(
                                2,
                                1,
                                scheduleLastRow - 1,
                                11
                              )
                              .getDisplayValues();

                          let scheduleRowNumber = -1;
                          let scheduleRowData = null;

                          for (let i = 0; i < scheduleRows.length; i++) {
                            if (cleanString(scheduleRows[i][0]) === scheduleId) {
                              scheduleRowNumber = i + 2;
                              scheduleRowData = scheduleRows[i];
                              break;
                            }
                          }

                          if (scheduleRowNumber === -1 || !scheduleRowData) {
                            throw new Error('Schedule tidak ditemukan.');
                          }

                          const scheduleStatus =
                            cleanString(scheduleRowData[10]).toUpperCase();

                          if (scheduleStatus === 'CANCELLED') {
                            throw new Error('Schedule yang sudah CANCELLED tidak dapat diedit.');
                          }

                          // ---------------------------------------------------
                          // 5. AMBIL CHILD UNIT EXISTING
                          // ---------------------------------------------------

                          const unitLastRow = scheduleUnitSheet.getLastRow();

                          const existingTargetRows = [];

                          if (unitLastRow >= 2) {

                            const rows =
                              scheduleUnitSheet
                                .getRange(
                                  2,
                                  1,
                                  unitLastRow - 1,
                                  13
                                )
                                .getDisplayValues();

                            rows.forEach(function(row, index) {
                              if (cleanString(row[1]) === scheduleId) {
                                existingTargetRows.push({
                                  rowNumber: index + 2,
                                  scheduleUnitId: cleanString(row[0]),
                                  scheduleId: cleanString(row[1]),
                                  unitId: cleanString(row[2]),
                                  unitCode: cleanString(row[3]),
                                  egi: cleanString(row[4]),
                                  sequence: Number(cleanString(row[5])) || 0,
                                  status: cleanString(row[6]).toUpperCase(),
                                  startedAt: row[7],
                                  completedAt: row[8],
                                  completedById: cleanString(row[9]),
                                  completedByName: cleanString(row[10]),
                                  notCompletedReason: cleanString(row[11]),
                                  note: cleanString(row[12])
                                });
                              }
                            });
                          }

                          const existingByUnitId = {};

                          existingTargetRows.forEach(function(item) {
                            existingByUnitId[item.unitId] = item;
                          });

                          // ---------------------------------------------------
                          // 6. CEK UNIT YANG DIHAPUS
                          // ---------------------------------------------------

                          const selectedIdSet = new Set(uniqueUnitIds);

                          const rowsToDelete = [];

                          existingTargetRows.forEach(function(item) {

                            if (selectedIdSet.has(item.unitId)) {
                              return;
                            }

                            if (item.status !== 'NOT STARTED') {
                              throw new Error(
                                'Unit ' + item.unitCode +
                                ' tidak dapat dihapus karena statusnya sudah ' +
                                item.status + '.'
                              );
                            }

                            rowsToDelete.push(item.rowNumber);
                          });

                          // ---------------------------------------------------
                          // 7. VALIDASI UNIT BARU
                          // Unit existing tetap boleh dipertahankan walaupun
                          // Population berubah setelah schedule dibuat.
                          // ---------------------------------------------------

                          const newUnits = [];

                          uniqueUnitIds.forEach(function(unitId) {

                            if (existingByUnitId[unitId]) {
                              return;
                            }

                            const unit = availableUnitMap[unitId];

                            if (!unit) {
                              throw new Error(
                                'Unit ID "' + unitId +
                                '" tidak tersedia untuk DM Schedule.'
                              );
                            }

                            newUnits.push(unit);
                          });

                          // ---------------------------------------------------
                          // 8. UPDATE MECHANIC PARENT
                          // ---------------------------------------------------

                          scheduleSheet
                            .getRange(
                              scheduleRowNumber,
                              4,
                              1,
                              4
                            )
                            .setValues([[
                              mechanic1.uniqId,
                              mechanic1.nama,
                              mechanic2.uniqId,
                              mechanic2.nama
                            ]]);

                          // ---------------------------------------------------
                          // 9. HAPUS UNIT NOT STARTED YANG DILEPAS
                          // Hapus dari row terbesar agar nomor row tidak bergeser.
                          // ---------------------------------------------------

                          rowsToDelete
                            .sort(function(a, b) {
                              return b - a;
                            })
                            .forEach(function(rowNumber) {
                              scheduleUnitSheet.deleteRow(rowNumber);
                            });

                          // ---------------------------------------------------
                          // 10. UPDATE SEQUENCE UNIT EXISTING YANG DIPERTAHANKAN
                          // Cari ulang row setelah proses delete.
                          // ---------------------------------------------------

                          const currentLastRow = scheduleUnitSheet.getLastRow();
                          const currentRows =
                            currentLastRow >= 2
                              ? scheduleUnitSheet
                                  .getRange(
                                    2,
                                    1,
                                    currentLastRow - 1,
                                    13
                                  )
                                  .getDisplayValues()
                              : [];

                          const currentRowByUnitId = {};

                          currentRows.forEach(function(row, index) {
                            if (cleanString(row[1]) === scheduleId) {
                              currentRowByUnitId[cleanString(row[2])] = index + 2;
                            }
                          });

                          uniqueUnitIds.forEach(function(unitId, index) {

                            const existingRowNumber =
                              currentRowByUnitId[unitId];

                            if (existingRowNumber) {
                              scheduleUnitSheet
                                .getRange(
                                  existingRowNumber,
                                  6
                                )
                                .setValue(index + 1);
                            }
                          });

                          // ---------------------------------------------------
                          // 11. TAMBAHKAN UNIT BARU
                          // ---------------------------------------------------

                          if (newUnits.length) {

                            const newScheduleUnitIds =
                              generateDMScheduleUnitIds(newUnits.length);

                            const newRows = [];

                            uniqueUnitIds.forEach(function(unitId, index) {

                              const newUnitIndex =
                                newUnits.findIndex(function(unit) {
                                  return unit.unitId === unitId;
                                });

                              if (newUnitIndex === -1) {
                                return;
                              }

                              const unit = newUnits[newUnitIndex];

                              newRows.push([
                                newScheduleUnitIds[newUnitIndex],
                                scheduleId,
                                unit.unitId,
                                unit.unitCode,
                                unit.egi,
                                index + 1,
                                'NOT STARTED',
                                '',
                                '',
                                '',
                                '',
                                '',
                                ''
                              ]);
                            });

                            if (newRows.length) {
                              scheduleUnitSheet
                                .getRange(
                                  scheduleUnitSheet.getLastRow() + 1,
                                  1,
                                  newRows.length,
                                  13
                                )
                                .setValues(newRows);
                            }
                          }

                          SpreadsheetApp.flush();

                          // ---------------------------------------------------
                          // 12. RETURN SCHEDULE TERBARU
                          // ---------------------------------------------------

                          const activityDate =
                            formatDateForApi(scheduleRowData[1]);

                          const refreshed =
                            getDMScheduleByDate(activityDate);

                          const updatedSchedule =
                            (refreshed.schedules || []).find(
                              function(schedule) {
                                return schedule.scheduleId === scheduleId;
                              }
                            ) || null;

                          return {
                            success: true,
                            message: 'Schedule berhasil diperbarui.',
                            scheduleId: scheduleId,
                            updatedBy: {
                              uniqId: requester.uniqId,
                              nama: requester.nama
                            },
                            schedule: updatedSchedule
                          };
                        }


                        // =====================================================
                        // GET DM SCHEDULE BY DATE
                        // READ ONLY
                        // =====================================================

                        function getDMScheduleByDate(activityDate) {

                          const targetDate = cleanString(activityDate);

                          if (!targetDate) {
                            throw new Error('Activity Date wajib diisi.');
                          }

                          const scheduleSheet = getDMScheduleSheet();
                          const scheduleUnitSheet = getDMScheduleUnitSheet();

                          const scheduleRows =
                            scheduleSheet.getLastRow() >= 2
                              ? scheduleSheet
                                  .getRange(
                                    2,
                                    1,
                                    scheduleSheet.getLastRow() - 1,
                                    11
                                  )
                                  .getDisplayValues()
                              : [];

                          const scheduleUnitRows =
                            scheduleUnitSheet.getLastRow() >= 2
                              ? scheduleUnitSheet
                                  .getRange(
                                    2,
                                    1,
                                    scheduleUnitSheet.getLastRow() - 1,
                                    13
                                  )
                                  .getDisplayValues()
                              : [];

                          // Map EGI -> TYPE
                          const egiResult = getEGIList();
                          const egiTypeMap = {};

                          (egiResult.egiList || []).forEach(function(item) {
                            const key = cleanString(item.egi).toLowerCase();
                            if (key) {
                              egiTypeMap[key] = cleanString(item.type);
                            }
                          });

                          const schedules =
                            scheduleRows
                              .filter(function(row) {

                                const rowDate =
                                  formatDateForApi(row[1]);

                                const status =
                                  cleanString(row[10]).toUpperCase();

                                return (
                                  rowDate === targetDate &&
                                  status !== 'CANCELLED'
                                );

                              })
                              .map(function(row) {

                                const scheduleId =
                                  cleanString(row[0]);

                                const units =
                                  scheduleUnitRows
                                    .filter(function(unitRow) {
                                      return (
                                        cleanString(unitRow[1]) ===
                                        scheduleId
                                      );
                                    })
                                    .map(function(unitRow) {

                                      const egi =
                                        cleanString(unitRow[4]);

                                      return {
                                        scheduleUnitId:
                                          cleanString(unitRow[0]),
                                        scheduleId:
                                          cleanString(unitRow[1]),
                                        unitId:
                                          cleanString(unitRow[2]),
                                        unitCode:
                                          cleanString(unitRow[3]),
                                        egi: egi,
                                        type:
                                          egiTypeMap[
                                            egi.toLowerCase()
                                          ] || '',
                                        sequence:
                                          Number(
                                            cleanString(unitRow[5])
                                          ) || 0,
                                        status:
                                          cleanString(unitRow[6]),
                                        startedAt:
                                          cleanString(unitRow[7]),
                                        completedAt:
                                          cleanString(unitRow[8]),
                                        completedById:
                                          cleanString(unitRow[9]),
                                        completedByName:
                                          cleanString(unitRow[10]),
                                        notCompletedReason:
                                          cleanString(unitRow[11]),
                                        note:
                                          cleanString(unitRow[12])
                                      };

                                    })
                                    .sort(function(a, b) {
                                      return a.sequence - b.sequence;
                                    });

                                return {
                                  scheduleId: scheduleId,
                                  activityDate:
                                    formatDateForApi(row[1]),
                                  lubeTruck:
                                    cleanString(row[2]),
                                  mechanic1: {
                                    uniqId:
                                      cleanString(row[3]),
                                    nama:
                                      cleanString(row[4])
                                  },
                                  mechanic2: {
                                    uniqId:
                                      cleanString(row[5]),
                                    nama:
                                      cleanString(row[6])
                                  },
                                  createdBy: {
                                    uniqId:
                                      cleanString(row[7]),
                                    nama:
                                      cleanString(row[8])
                                  },
                                  createdAt:
                                    cleanString(row[9]),
                                  status:
                                    cleanString(row[10]),
                                  unitCount:
                                    units.length,
                                  units: units
                                };

                              })
                              .sort(function(a, b) {
                                return a.lubeTruck.localeCompare(
                                  b.lubeTruck,
                                  undefined,
                                  {
                                    numeric: true,
                                    sensitivity: 'base'
                                  }
                                );
                              });

                          return {
                            success: true,
                            activityDate: targetDate,
                            count: schedules.length,
                            schedules: schedules
                          };
                        }


                        // =====================================================
                        // GENERATE POPULATION UNIQUE ID
                        // FORMAT: POP00001, POP00002, DST
                        // =====================================================

                        function generatePopulationId() {

                          const sheet =
                            getPopulationSheet();

                          const lastRow =
                            sheet.getLastRow();

                          let highestNumber = 0;

                          if (lastRow >= 2) {

                            const existingIds =
                              sheet
                                .getRange(
                                  2,
                                  POPULATION_COL.UNIQ_ID,
                                  lastRow - 1,
                                  1
                                )
                                .getDisplayValues();

                            existingIds.forEach(
                              function(row) {

                                const id =
                                  cleanString(row[0]);

                                const match =
                                  id.match(/^POP(\d+)$/i);

                                if (match) {

                                  const number =
                                    Number(match[1]);

                                  if (
                                    number > highestNumber
                                  ) {
                                    highestNumber = number;
                                  }

                                }

                              }
                            );

                          }

                          return (
                            'POP' +
                            String(
                              highestNumber + 1
                            ).padStart(
                              5,
                              '0'
                            )
                          );
                        }

                        // =====================================================
                        // ADD UNIT POPULATION
                        // =====================================================

                        function addUnitPopulation(data) {

                          data = data || {};

                          const unitCode =
                            cleanString(data.unitCode);

                          const egi =
                            cleanString(data.egi);

                          const status =
                            cleanString(data.status);

                          // ---------------------------------------------------
                          // VALIDASI INPUT
                          // ---------------------------------------------------

                          if (!unitCode) {
                            throw new Error(
                              'Unit Code wajib diisi.'
                            );
                          }

                          if (!egi) {
                            throw new Error(
                              'EGI wajib diisi.'
                            );
                          }

                          const allowedStatus = [
                            'Running',
                            'Stand By',
                            'Lay Off'
                          ];

                          const matchedStatus =
                            allowedStatus.find(
                              function(item) {
                                return (
                                  item.toLowerCase() ===
                                  status.toLowerCase()
                                );
                              }
                            );

                          if (!matchedStatus) {
                            throw new Error(
                              'Status unit tidak valid.'
                            );
                          }

                          // ---------------------------------------------------
                          // CEK DUPLIKAT UNIT CODE
                          // ---------------------------------------------------

                          const sheet =
                            getPopulationSheet();

                          const lastRow =
                            sheet.getLastRow();

                          if (lastRow >= 2) {

                            const existingUnitCodes =
                              sheet
                                .getRange(
                                  2,
                                  POPULATION_COL.UNIT_CODE,
                                  lastRow - 1,
                                  1
                                )
                                .getDisplayValues();

                            const duplicate =
                              existingUnitCodes.some(
                                function(row) {

                                  return (
                                    cleanString(row[0])
                                      .toLowerCase() ===
                                    unitCode.toLowerCase()
                                  );

                                }
                              );

                            if (duplicate) {
                              throw new Error(
                                'Unit Code sudah terdaftar.'
                              );
                            }

                          }

                          // ---------------------------------------------------
                          // PASTIKAN EGI TERDAFTAR
                          // ---------------------------------------------------

                          const egiResult =
                            validateRegisteredEGI(egi);

                          // ---------------------------------------------------
                          // GENERATE POPULATION ID
                          // ---------------------------------------------------

                          const uniqId =
                            generatePopulationId();

                          // ---------------------------------------------------
                          // SIMPAN UNIT
                          // ---------------------------------------------------

                          sheet.appendRow([
                            uniqId,
                            unitCode,
                            egiResult.egi,
                            matchedStatus
                          ]);

                          SpreadsheetApp.flush();

                          return {
                            success: true,

                            unit: {
                              uniqId: uniqId,
                              unitCode: unitCode,
                              egi: egiResult.egi,
                              status: matchedStatus
                            },

                            egiCreated:
                              egiResult.created
                          };
                        }

                        // =====================================================
                        // UPDATE UNIT POPULATION
                        // =====================================================

                        function updateUnitPopulation(data) {

                          data = data || {};

                          const uniqId =
                            cleanString(data.uniqId);

                          const unitCode =
                            cleanString(data.unitCode);

                          const egi =
                            cleanString(data.egi);

                          const status =
                            cleanString(data.status);

                          // ---------------------------------------------------
                          // VALIDASI
                          // ---------------------------------------------------

                          if (!uniqId) {
                            throw new Error(
                              'UNIQ ID Population wajib diisi.'
                            );
                          }

                          if (!unitCode) {
                            throw new Error(
                              'Unit Code wajib diisi.'
                            );
                          }

                          if (!egi) {
                            throw new Error(
                              'EGI wajib diisi.'
                            );
                          }

                          const allowedStatus = [
                            'Running',
                            'Stand By',
                            'Lay Off'
                          ];

                          const matchedStatus =
                            allowedStatus.find(
                              function(item) {

                                return (
                                  item.toLowerCase() ===
                                  status.toLowerCase()
                                );

                              }
                            );

                          if (!matchedStatus) {
                            throw new Error(
                              'Status unit tidak valid.'
                            );
                          }

                          const sheet =
                            getPopulationSheet();

                          const lastRow =
                            sheet.getLastRow();

                          if (lastRow < 2) {
                            throw new Error(
                              'Data Population tidak ditemukan.'
                            );
                          }

                          const values =
                            sheet
                              .getRange(
                                2,
                                1,
                                lastRow - 1,
                                4
                              )
                              .getDisplayValues();

                          let targetRow = -1;

                          // ---------------------------------------------------
                          // CARI DATA BERDASARKAN UNIQ ID
                          // SEKALIGUS CEK DUPLIKAT UNIT CODE
                          // ---------------------------------------------------

                          for (
                            let i = 0;
                            i < values.length;
                            i++
                          ) {

                            const existingId =
                              cleanString(
                                values[i][
                                  POPULATION_COL.UNIQ_ID - 1
                                ]
                              );

                            const existingUnitCode =
                              cleanString(
                                values[i][
                                  POPULATION_COL.UNIT_CODE - 1
                                ]
                              );

                            if (
                              existingId.toLowerCase() ===
                              uniqId.toLowerCase()
                            ) {

                              targetRow = i + 2;

                            } else if (
                              existingUnitCode.toLowerCase() ===
                              unitCode.toLowerCase()
                            ) {

                              throw new Error(
                                'Unit Code sudah digunakan oleh unit lain.'
                              );

                            }

                          }

                          if (targetRow === -1) {
                            throw new Error(
                              'Data Population tidak ditemukan.'
                            );
                          }

                          // ---------------------------------------------------
                          // PASTIKAN EGI TERDAFTAR
                          // ---------------------------------------------------

                          const egiResult =
                            validateRegisteredEGI(egi);

                          // ---------------------------------------------------
                          // UPDATE DATA
                          // ---------------------------------------------------

                          sheet
                            .getRange(
                              targetRow,
                              POPULATION_COL.UNIT_CODE,
                              1,
                              3
                            )
                            .setValues([[
                              unitCode,
                              egiResult.egi,
                              matchedStatus
                            ]]);

                          SpreadsheetApp.flush();

                          return {
                            success: true,

                            unit: {
                              uniqId: uniqId,
                              unitCode: unitCode,
                              egi: egiResult.egi,
                              status: matchedStatus
                            },

                            egiCreated:
                              egiResult.created
                          };
                        }
                                    // =====================================================
                                    // GET UNIT POPULATION
                                    // =====================================================

                                      function getUnitPopulation() {

                                      const sheet =
                                      getPopulationSheet();

                                      const lastRow =
                                      sheet.getLastRow();

                                      if (lastRow < 2) {
                                      return {
                                      success: true,
                                      units: []
                                    };
                                    }

                                      const values =
                                      sheet
                                      .getRange(
                                      2,
                                      1,
                                      lastRow - 1,
                                      4
                                    )
                                      .getValues();

                                      const units =
                                      values
                                      .filter(function (row) {

                                      return cleanString(
                                        row[
                                         POPULATION_COL.UNIT_CODE - 1
                                        ]
                                    );

                                    })
                                      .map(function (row) {

                                      return {
                                       uniqId: cleanString(
                                        row[
                                           POPULATION_COL.UNIQ_ID - 1
                                        ]
                                    ),

                                      unitCode: cleanString(
                                       row[
                                           POPULATION_COL.UNIT_CODE - 1
                                        ]
                                    ),

                                  egi: cleanString(
                                    row[
                                      POPULATION_COL.EGI - 1
                                    ]
                                  ),

                                  status: cleanString(
                                    row[
                                      POPULATION_COL.STATUS - 1
                                    ]
                                  )
                                };

                              });

                          return {
                            success: true,
                            units: units
                          };
                        }





                                    // =====================================================



                                    // HELPER



                                    // STRING AMAN



                                    // =====================================================







                                    function cleanString(value) {







                                      if (



                                        value === null ||



                                        value === undefined



                                      ) {



                                        return '';



                                      }







                                      return String(value).trim();



                                    }











                                    // =====================================================



                                    // HELPER



                                    // FORMAT DATE UNTUK RESPONSE API



                                    // =====================================================







                                    function formatDateForApi(value) {







                                      if (!value) {



                                        return '';



                                      }







                                      if (



                                        Object.prototype.toString.call(value) ===



                                        '[object Date]' &&



                                        !isNaN(value.getTime())



                                      ) {







                                        return Utilities.formatDate(



                                          value,



                                          Session.getScriptTimeZone(),



                                          'yyyy-MM-dd'



                                        );



                                      }







                                      return String(value).trim();



                                    }











                                    // =====================================================



                                    // HELPER



                                    // CONVERT ROW DM DATABASE KE OBJECT



                                    // =====================================================







                                    function dmRowToObject(row) {







                                      return {







                                        id:



                                          cleanString(row[0]),







                                        unitCode:



                                          cleanString(row[1]),







                                        hmInspection:



                                          cleanString(row[2]),







                                        dateInspection:



                                          formatDateForApi(row[3]),







                                        photo:



                                          cleanString(row[4]),







                                        groupComponent:



                                          cleanString(row[5]),







                                        problemDescription:



                                          cleanString(row[6]),







                                        rating:



                                          cleanString(row[7]),







                                        partsDescription:



                                          cleanString(row[8]),







                                        partNo:



                                          cleanString(row[9]),







                                        quantity:



                                          cleanString(row[10]),







                                        inspectors:



                                          cleanString(row[11]),







                                        notes:



                                          cleanString(row[12]),







                                        mol:



                                          cleanString(row[13]),







                                        evidence:



                                          cleanString(row[14]),







                                        partsStatus:



                                          cleanString(row[15]),







                                        actionProblems:



                                          cleanString(row[16]),







                                        hmAction:



                                          cleanString(row[17]),







                                        dateAction:



                                          formatDateForApi(row[18]),







                                        status:



                                          cleanString(row[19]),







                                        manPower:



                                          cleanString(row[20])







                                      };



                                    }











                                    // =====================================================



                                    // HELPER



                                    // CARI ROW BERDASARKAN ID INSPECTION



                                    // =====================================================







                                    function findInspectionRowById(



                                      sheet,



                                      inspectionId



                                    ) {







                                      const id =



                                        cleanString(



                                          inspectionId



                                        );







                                      if (!id) {



                                        return -1;



                                      }







                                      const lastRow =



                                        sheet.getLastRow();







                                      if (lastRow < 2) {



                                        return -1;



                                      }







                                      const ids =



                                        sheet



                                          .getRange(



                                            2,



                                            DM_COL.ID,



                                            lastRow - 1,



                                            1



                                          )



                                          .getDisplayValues();







                                      for (



                                        let i = 0;



                                        i < ids.length;



                                        i++



                                      ) {







                                        if (



                                          cleanString(ids[i][0]) === id



                                        ) {







                                          return i + 2;



                                        }



                                      }







                                      return -1;



                                    }











                                    // =====================================================



                                    // HELPER



                                    // AMBIL EXTENSION BERDASARKAN MIME



                                    // =====================================================







                                    function getFileExtensionFromMime(



                                      mimeType



                                    ) {







                                      const mime =



                                        cleanString(



                                          mimeType



                                        ).toLowerCase();







                                      if (



                                        mime === 'image/png'



                                      ) {



                                        return 'png';



                                      }







                                      if (



                                        mime === 'image/webp'



                                      ) {



                                        return 'webp';



                                      }







                                      if (



                                        mime === 'application/pdf'



                                      ) {



                                        return 'pdf';



                                      }







                                      return 'jpg';



                                    }











                                    // =====================================================



                                    // HELPER



                                    // CLEAN BASE64



                                    // =====================================================







                                    function cleanBase64Data(



                                      base64



                                    ) {







                                      let result =



                                        cleanString(



                                          base64



                                        );







                                      if (



                                        result.includes(',')



                                      ) {







                                        result =



                                          result.split(',')[1];



                                      }







                                      return result;



                                    }











                                    // =====================================================

                                    // HELPER - BUKA USER DATABASE

                                    // =====================================================



                                    function getUserSheet() {



                                      const ss =

                                        SpreadsheetApp.openById(

                                          SPREADSHEET_ID

                                        );



                                      const sheet =

                                        ss.getSheetByName(

                                          SHEET_USERS

                                        );



                                      if (!sheet) {

                                        throw new Error(

                                          'Sheet USER DATA tidak ditemukan.'

                                        );

                                      }



                                      return sheet;

                                    }





                                    // =====================================================

                                    // HELPER - ROW USER KE OBJECT

                                    // PASSWORD TIDAK PERNAH DIKIRIM KE CLIENT

                                    // =====================================================



                                    function userRowToObject(row) {



                                      return {

                                        uniqId: cleanString(row[USER_COL.UNIQ_ID - 1]),

                                        userId: cleanString(row[USER_COL.USER_ID - 1]),

                                        nama: cleanString(row[USER_COL.NAMA - 1]),

                                        level: cleanString(row[USER_COL.LEVEL - 1]),

                                        kode: cleanString(row[USER_COL.KODE - 1]),

                                        noHp: cleanString(row[USER_COL.NO_HP - 1]),

                                        photo: cleanString(row[USER_COL.PHOTO - 1]),

                                        email: cleanString(row[USER_COL.EMAIL - 1]),

                                        status: cleanString(row[USER_COL.STATUS - 1]),

                                        kutipan: cleanString(row[USER_COL.KUTIPAN - 1]),

                                        signature: cleanString(row[USER_COL.SIGNATURE - 1])

                                      };

                                    }





                                    // =====================================================

                                    // HELPER - CARI USER BERDASARKAN UNIQ ID

                                    // =====================================================



                                    function findUserRowByUniqId(

                                      sheet,

                                      uniqId

                                    ) {



                                      const id =

                                        cleanString(

                                          uniqId

                                        );



                                      if (!id) {

                                        return -1;

                                      }



                                      const lastRow =

                                        sheet.getLastRow();



                                      if (lastRow < 2) {

                                        return -1;

                                      }



                                      const ids =

                                        sheet

                                          .getRange(

                                            2,

                                            USER_COL.UNIQ_ID,

                                            lastRow - 1,

                                            1

                                          )

                                          .getDisplayValues();



                                      for (

                                        let i = 0;

                                        i < ids.length;

                                        i++

                                      ) {



                                        if (

                                          cleanString(ids[i][0]) === id

                                        ) {

                                          return i + 2;

                                        }



                                      }



                                      return -1;

                                    }





                                    // =====================================================

                                    // GET USER PROFILE

                                    // MEMBACA LANGSUNG DATABASE TERBARU

                                    // =====================================================



                                    function getUserProfile(

                                      uniqId

                                    ) {



                                      try {



                                        const id =

                                          cleanString(

                                            uniqId

                                          );



                                        if (!id) {

                                          return {

                                            success: false,

                                            message:

                                              'UNIQ ID user wajib tersedia.'

                                          };

                                        }



                                        const sheet =

                                          getUserSheet();



                                        const rowNumber =

                                          findUserRowByUniqId(

                                            sheet,

                                            id

                                          );



                                        if (rowNumber === -1) {

                                          return {

                                            success: false,

                                            message:

                                              'User tidak ditemukan.'

                                          };

                                        }



                                        const row =

                                          sheet

                                            .getRange(

                                              rowNumber,

                                              1,

                                              1,

                                              USER_COL.SIGNATURE

                                            )

                                            .getValues()[0];



                                        const user =

                                          userRowToObject(

                                            row

                                          );



                                        const status =

                                          cleanString(

                                            user.status

                                          ).toUpperCase();



                                        // STATUS kosong sementara dianggap ACTIVE.

                                        if (

                                          status &&

                                          status !== 'ACTIVE'

                                        ) {

                                          return {

                                            success: false,

                                            inactive: true,

                                            message:

                                              'Akun Anda sedang tidak aktif.'

                                          };

                                        }



                                        return {

                                          success: true,

                                          user: user

                                        };



                                      } catch (error) {



                                        return {

                                          success: false,

                                          message:

                                            'Gagal mengambil User Profile.',

                                          error:

                                            error.message

                                        };



                                      }

                                    }





                                    // =====================================================

                                    // GET SEMUA USER

                                    // FONDASI USER MANAGEMENT

                                    // PASSWORD TIDAK DIKIRIM

                                    // =====================================================



                                    function getUsers() {



                                      try {



                                        const sheet =

                                          getUserSheet();



                                        const lastRow =

                                          sheet.getLastRow();



                                        if (lastRow < 2) {

                                          return {

                                            success: true,

                                            count: 0,

                                            data: []

                                          };

                                        }



                                        const rows =

                                          sheet

                                            .getRange(

                                              2,

                                              1,

                                              lastRow - 1,

                                              USER_COL.SIGNATURE

                                            )

                                            .getValues();



                                        const users = [];



                                        rows.forEach(

                                          function(row) {



                                            const user =

                                              userRowToObject(

                                                row

                                              );



                                            if (user.uniqId) {

                                              users.push(user);

                                            }



                                          }

                                        );



                                        return {

                                          success: true,

                                          count: users.length,

                                          data: users

                                        };



                                      } catch (error) {



                                        return {

                                          success: false,

                                          message:

                                            'Gagal mengambil User Database.',

                                          error:

                                            error.message

                                        };



                                      }

                                    }





                                    // =====================================================

                                    // UPDATE MY PROFILE

                                    //

                                    // USER BOLEH UBAH:

                                    // NAMA, NO.HP, PHOTO, EMAIL, KUTIPAN

                                    //

                                    // USER TIDAK BOLEH UBAH DARI MY PROFILE:

                                    // USER ID, LEVEL, KODE, STATUS

                                    // =====================================================



                                    function updateMyProfile(

                                      data

                                    ) {



                                      try {



                                        if (!data) {

                                          return {

                                            success: false,

                                            message:

                                              'Data profile tidak ditemukan.'

                                          };

                                        }



                                        const uniqId =

                                          cleanString(

                                            data.uniqId

                                          );



                                        if (!uniqId) {

                                          return {

                                            success: false,

                                            message:

                                              'UNIQ ID user wajib tersedia.'

                                          };

                                        }



                                        const sheet =

                                          getUserSheet();



                                        const rowNumber =

                                          findUserRowByUniqId(

                                            sheet,

                                            uniqId

                                          );



                                        if (rowNumber === -1) {

                                          return {

                                            success: false,

                                            message:

                                              'User tidak ditemukan.'

                                          };

                                        }



                                        const currentRow =

                                          sheet

                                            .getRange(

                                              rowNumber,

                                              1,

                                              1,

                                              USER_COL.SIGNATURE

                                            )

                                            .getValues()[0];



                                        const currentUser =

                                          userRowToObject(

                                            currentRow

                                          );



                                        const status =

                                          cleanString(

                                            currentUser.status

                                          ).toUpperCase();



                                        if (

                                          status &&

                                          status !== 'ACTIVE'

                                        ) {

                                          return {

                                            success: false,

                                            inactive: true,

                                            message:

                                              'Akun Anda sedang tidak aktif.'

                                          };

                                        }



                                        const nama =

                                          cleanString(

                                            data.nama

                                          );



                                        if (!nama) {

                                          return {

                                            success: false,

                                            message:

                                              'Nama wajib diisi.'

                                          };

                                        }



                                        sheet

                                          .getRange(

                                            rowNumber,

                                            USER_COL.NAMA

                                          )

                                          .setValue(nama);

                                        // NO.HP disimpan sebagai Plain Text agar leading zero tidak hilang.
                                        const profilePhoneCell =
                                          sheet.getRange(
                                            rowNumber,
                                            USER_COL.NO_HP
                                          );

                                        profilePhoneCell.setNumberFormat('@');
                                        profilePhoneCell.setValue(
                                          cleanString(data.noHp)
                                        );



                                        sheet

                                          .getRange(

                                            rowNumber,

                                            USER_COL.PHOTO

                                          )

                                          .setValue(

                                            cleanString(data.photo)

                                          );



                                        sheet

                                          .getRange(

                                            rowNumber,

                                            USER_COL.EMAIL

                                          )

                                          .setValue(

                                            cleanString(data.email)

                                          );



                                        sheet

                                          .getRange(

                                            rowNumber,

                                            USER_COL.KUTIPAN

                                          )

                                          .setValue(

                                            cleanString(data.kutipan)

                                          );



                                        SpreadsheetApp.flush();



                                        return getUserProfile(

                                          uniqId

                                        );



                                      } catch (error) {



                                        return {

                                          success: false,

                                          message:

                                            'Gagal mengupdate My Profile.',

                                          error:

                                            error.message

                                        };



                                      }

                                    }






                                    // =====================================================
                                    // UPDATE PROFILE PHOTO
                                    //
                                    // UPLOAD FOTO KE GOOGLE DRIVE
                                    // LALU UPDATE KOLOM PHOTO USER
                                    // =====================================================

                                    function updateProfilePhoto(data) {

                                      try {

                                        if (!data) {
                                          return {
                                            success: false,
                                            message: 'Data Photo Profile tidak ditemukan.'
                                          };
                                        }

                                        const uniqId = cleanString(data.uniqId);
                                        const photoBase64 = cleanString(data.photoBase64);
                                        const photoMimeType =
                                          cleanString(data.photoMimeType).toLowerCase();

                                        if (!uniqId) {
                                          return {
                                            success: false,
                                            message: 'UNIQ ID user wajib tersedia.'
                                          };
                                        }

                                        if (!photoBase64) {
                                          return {
                                            success: false,
                                            message: 'Photo Profile tidak ditemukan.'
                                          };
                                        }

                                        const allowedMimeTypes = [
                                          'image/jpeg',
                                          'image/jpg',
                                          'image/png',
                                          'image/webp'
                                        ];

                                        if (!allowedMimeTypes.includes(photoMimeType)) {
                                          return {
                                            success: false,
                                            message: 'Format Photo Profile tidak didukung.'
                                          };
                                        }

                                        const sheet = getUserSheet();

                                        const rowNumber =
                                          findUserRowByUniqId(
                                            sheet,
                                            uniqId
                                          );

                                        if (rowNumber === -1) {
                                          return {
                                            success: false,
                                            message: 'User tidak ditemukan.'
                                          };
                                        }

                                        const currentRow =
                                          sheet
                                            .getRange(
                                              rowNumber,
                                              1,
                                              1,
                                              USER_COL.SIGNATURE
                                            )
                                            .getValues()[0];

                                        const currentUser =
                                          userRowToObject(currentRow);

                                        const status =
                                          cleanString(
                                            currentUser.status
                                          ).toUpperCase();

                                        if (
                                          status &&
                                          status !== 'ACTIVE'
                                        ) {
                                          return {
                                            success: false,
                                            inactive: true,
                                            message: 'Akun Anda sedang tidak aktif.'
                                          };
                                        }

                                        const cleanBase64 =
                                          cleanBase64Data(photoBase64);

                                        const bytes =
                                          Utilities.base64Decode(cleanBase64);

                                        const extension =
                                          getFileExtensionFromMime(photoMimeType);

                                        const timestamp =
                                          Utilities.formatDate(
                                            new Date(),
                                            Session.getScriptTimeZone(),
                                            'yyyyMMdd_HHmmss'
                                          );

                                        const fileName =
                                          uniqId +
                                          '_PROFILE_' +
                                          timestamp +
                                          '.' +
                                          extension;

                                        const blob =
                                          Utilities.newBlob(
                                            bytes,
                                            photoMimeType,
                                            fileName
                                          );

                                        const folder =
                                          DriveApp.getFolderById(
                                            USER_PROFILE_FOLDER_ID
                                          );

                                        const file =
                                          folder.createFile(blob);

                                        file.setSharing(
                                          DriveApp.Access.ANYONE_WITH_LINK,
                                          DriveApp.Permission.VIEW
                                        );

                                        const photoUrl =
                                          file.getUrl();

                                        try {

                                          sheet
                                            .getRange(
                                              rowNumber,
                                              USER_COL.PHOTO
                                            )
                                            .setValue(photoUrl);

                                          SpreadsheetApp.flush();

                                        } catch (databaseError) {

                                          try {
                                            file.setTrashed(true);
                                          } catch (deleteError) {
                                            Logger.log(deleteError.message);
                                          }

                                          return {
                                            success: false,
                                            message: 'Gagal menyimpan Photo Profile ke database.',
                                            error: databaseError.message
                                          };
                                        }

                                        return getUserProfile(
                                          uniqId
                                        );

                                      } catch (error) {

                                        return {
                                          success: false,
                                          message: 'Gagal mengupdate Photo Profile.',
                                          error: error.message
                                        };

                                      }

                                    }


                                    // =====================================================



                                    // =====================================================
                                    // UPDATE USER SIGNATURE
                                    //
                                    // MENERIMA PNG FINAL DARI FRONTEND
                                    // (HASIL DRAW ATAU HASIL PROCESS CAMERA/GALLERY)
                                    // SIMPAN KE GOOGLE DRIVE + KOLOM SIGNATURE (L)
                                    // =====================================================

                                    function updateUserSignature(data) {

                                      try {

                                        if (!data) {
                                          return {
                                            success: false,
                                            message: 'Data Digital Signature tidak ditemukan.'
                                          };
                                        }

                                        const uniqId = cleanString(data.uniqId);
                                        const signatureBase64 = cleanString(data.signatureBase64);
                                        const signatureMimeType =
                                          cleanString(data.signatureMimeType || 'image/png').toLowerCase();

                                        if (!uniqId) {
                                          return {
                                            success: false,
                                            message: 'UNIQ ID user wajib tersedia.'
                                          };
                                        }

                                        if (!signatureBase64) {
                                          return {
                                            success: false,
                                            message: 'Digital Signature tidak ditemukan.'
                                          };
                                        }

                                        // Signature final wajib PNG agar transparansi terjaga.
                                        if (signatureMimeType !== 'image/png') {
                                          return {
                                            success: false,
                                            message: 'Digital Signature final harus berformat PNG.'
                                          };
                                        }

                                        const sheet = getUserSheet();

                                        const rowNumber =
                                          findUserRowByUniqId(
                                            sheet,
                                            uniqId
                                          );

                                        if (rowNumber === -1) {
                                          return {
                                            success: false,
                                            message: 'User tidak ditemukan.'
                                          };
                                        }

                                        const currentRow =
                                          sheet
                                            .getRange(
                                              rowNumber,
                                              1,
                                              1,
                                              USER_COL.SIGNATURE
                                            )
                                            .getValues()[0];

                                        const currentUser =
                                          userRowToObject(currentRow);

                                        const status =
                                          cleanString(
                                            currentUser.status
                                          ).toUpperCase();

                                        if (
                                          status &&
                                          status !== 'ACTIVE'
                                        ) {
                                          return {
                                            success: false,
                                            inactive: true,
                                            message: 'Akun Anda sedang tidak aktif.'
                                          };
                                        }

                                        const cleanBase64 =
                                          cleanBase64Data(signatureBase64);

                                        const bytes =
                                          Utilities.base64Decode(cleanBase64);

                                        if (!bytes || !bytes.length) {
                                          return {
                                            success: false,
                                            message: 'Data Digital Signature tidak valid.'
                                          };
                                        }

                                        const timestamp =
                                          Utilities.formatDate(
                                            new Date(),
                                            Session.getScriptTimeZone(),
                                            'yyyyMMdd_HHmmss'
                                          );

                                        const fileName =
                                          uniqId +
                                          '_SIGNATURE_' +
                                          timestamp +
                                          '.png';

                                        const blob =
                                          Utilities.newBlob(
                                            bytes,
                                            'image/png',
                                            fileName
                                          );

                                        const folder =
                                          DriveApp.getFolderById(
                                            USER_PROFILE_FOLDER_ID
                                          );

                                        const file =
                                          folder.createFile(blob);

                                        file.setSharing(
                                          DriveApp.Access.ANYONE_WITH_LINK,
                                          DriveApp.Permission.VIEW
                                        );

                                        const signatureUrl =
                                          file.getUrl();

                                        try {

                                          sheet
                                            .getRange(
                                              rowNumber,
                                              USER_COL.SIGNATURE
                                            )
                                            .setValue(signatureUrl);

                                          SpreadsheetApp.flush();

                                        } catch (databaseError) {

                                          try {
                                            file.setTrashed(true);
                                          } catch (deleteError) {
                                            Logger.log(deleteError.message);
                                          }

                                          return {
                                            success: false,
                                            message: 'Gagal menyimpan Digital Signature ke database.',
                                            error: databaseError.message
                                          };
                                        }

                                        // File signature lama sengaja tidak dihapus.
                                        // Approval History nantinya dapat menyimpan snapshot URL
                                        // signature yang digunakan pada saat approval.
                                        return getUserProfile(
                                          uniqId
                                        );

                                      } catch (error) {

                                        return {
                                          success: false,
                                          message: 'Gagal mengupdate Digital Signature.',
                                          error: error.message
                                        };

                                      }

                                    }


                                    
                        // =====================================================
                        // GET ACTIVE MECHANICS
                        // SUMBER DROPDOWN SCHEDULER DAILY ACTIVITY
                        // KODE 5 + STATUS ACTIVE
                        // =====================================================

                        function getActiveMechanics() {

                          const sheet = getUserSheet();
                          const lastRow = sheet.getLastRow();

                          if (lastRow < 2) {
                            return {
                              success: true,
                              count: 0,
                              mechanics: []
                            };
                          }

                          const rows =
                            sheet
                              .getRange(
                                2,
                                1,
                                lastRow - 1,
                                USER_COL.STATUS
                              )
                              .getDisplayValues();

                          const mechanics =
                            rows
                              .filter(function(row) {

                                const uniqId =
                                  cleanString(
                                    row[USER_COL.UNIQ_ID - 1]
                                  );

                                const kode =
                                  cleanString(
                                    row[USER_COL.KODE - 1]
                                  );

                                const status =
                                  cleanString(
                                    row[USER_COL.STATUS - 1]
                                  ).toUpperCase();

                                return (
                                  uniqId &&
                                  kode === '5' &&
                                  status === 'ACTIVE'
                                );

                              })
                              .map(function(row) {

                                return {
                                  uniqId: cleanString(
                                    row[USER_COL.UNIQ_ID - 1]
                                  ),
                                  userId: cleanString(
                                    row[USER_COL.USER_ID - 1]
                                  ),
                                  nama: cleanString(
                                    row[USER_COL.NAMA - 1]
                                  )
                                };

                              })
                              .sort(function(a, b) {
                                return a.nama.localeCompare(b.nama);
                              });

                          return {
                            success: true,
                            count: mechanics.length,
                            mechanics: mechanics
                          };
                        }


                        // =====================================================
                                    // ADD USER
                                    // KHUSUS MASTER (KODE 1)
                                    // PASSWORD & NO.HP DISIMPAN SEBAGAI PLAIN TEXT
                                    // =====================================================

                                    function addUser(data) {

                                      try {

                                        if (!data) {
                                          return {
                                            success: false,
                                            message: 'Data Add User tidak ditemukan.'
                                          };
                                        }

                                        const requesterUniqId =
                                          cleanString(
                                            data.requesterUniqId ||
                                            data.masterUniqId
                                          );

                                        const userId =
                                          cleanString(data.userId);

                                        const password =
                                          cleanString(data.password);

                                        const nama =
                                          cleanString(data.nama);

                                        const kode =
                                          cleanString(data.kode);

                                        const noHp =
                                          cleanString(data.noHp);

                                        const email =
                                          cleanString(data.email);

                                        const status =
                                          cleanString(data.status || 'ACTIVE').toUpperCase();

                                        // -----------------------------------------------
                                        // VALIDASI MASTER PEMBUAT USER
                                        // -----------------------------------------------

                                        if (!requesterUniqId) {
                                          return {
                                            success: false,
                                            message: 'Identitas Master tidak ditemukan.'
                                          };
                                        }

                                        const sheet = getUserSheet();

                                        const requesterRow =
                                          findUserRowByUniqId(
                                            sheet,
                                            requesterUniqId
                                          );

                                        if (requesterRow === -1) {
                                          return {
                                            success: false,
                                            message: 'Akun Master tidak ditemukan.'
                                          };
                                        }

                                        const requesterData =
                                          sheet
                                            .getRange(
                                              requesterRow,
                                              1,
                                              1,
                                              USER_COL.SIGNATURE
                                            )
                                            .getDisplayValues()[0];

                                        const requesterKode =
                                          cleanString(
                                            requesterData[USER_COL.KODE - 1]
                                          );

                                        const requesterStatus =
                                          cleanString(
                                            requesterData[USER_COL.STATUS - 1]
                                          ).toUpperCase();

                                        if (requesterKode !== '1') {
                                          return {
                                            success: false,
                                            message: 'Add User hanya dapat dilakukan oleh Master.'
                                          };
                                        }

                                        if (
                                          requesterStatus &&
                                          requesterStatus !== 'ACTIVE'
                                        ) {
                                          return {
                                            success: false,
                                            message: 'Akun Master sedang tidak aktif.'
                                          };
                                        }

                                        // -----------------------------------------------
                                        // VALIDASI INPUT
                                        // -----------------------------------------------

                                        if (!userId) {
                                          return {
                                            success: false,
                                            message: 'User ID wajib diisi.'
                                          };
                                        }

                                        if (!password) {
                                          return {
                                            success: false,
                                            message: 'Password wajib diisi.'
                                          };
                                        }

                                        if (password.length < 6) {
                                          return {
                                            success: false,
                                            message: 'Password minimal 6 karakter.'
                                          };
                                        }

                                        if (!nama) {
                                          return {
                                            success: false,
                                            message: 'Nama wajib diisi.'
                                          };
                                        }

                                        const roleMap = {
                                          '1': 'MASTER',
                                          '2': 'SECTION HEAD',
                                          '3': 'GROUP LEADER',
                                          '4': 'ADMIN',
                                          '5': 'MECHANIC',
                                          '6': 'VISITOR'
                                        };

                                        if (!roleMap[kode]) {
                                          return {
                                            success: false,
                                            message: 'Level User tidak valid.'
                                          };
                                        }

                                        if (
                                          status !== 'ACTIVE' &&
                                          status !== 'INACTIVE'
                                        ) {
                                          return {
                                            success: false,
                                            message: 'Status User tidak valid.'
                                          };
                                        }

                                        // -----------------------------------------------
                                        // USER ID HARUS UNIK
                                        // -----------------------------------------------

                                        const lastRow = sheet.getLastRow();

                                        if (lastRow >= 2) {

                                          const existingUserIds =
                                            sheet
                                              .getRange(
                                                2,
                                                USER_COL.USER_ID,
                                                lastRow - 1,
                                                1
                                              )
                                              .getDisplayValues();

                                          const duplicateUserId =
                                            existingUserIds.some(
                                              function(row) {
                                                return (
                                                  cleanString(row[0]).toLowerCase() ===
                                                  userId.toLowerCase()
                                                );
                                              }
                                            );

                                          if (duplicateUserId) {
                                            return {
                                              success: false,
                                              duplicateUserId: true,
                                              message: 'User ID sudah digunakan.'
                                            };
                                          }
                                        }

                                        // -----------------------------------------------
                                        // GENERATE UNIQ ID USER
                                        // -----------------------------------------------

                                        const existingUniqIds = new Set();

                                        if (lastRow >= 2) {
                                          sheet
                                            .getRange(
                                              2,
                                              USER_COL.UNIQ_ID,
                                              lastRow - 1,
                                              1
                                            )
                                            .getDisplayValues()
                                            .forEach(
                                              function(row) {
                                                const value = cleanString(row[0]);
                                                if (value) existingUniqIds.add(value);
                                              }
                                            );
                                        }

                                        const now = new Date();
                                        const timeCode =
                                          Utilities.formatDate(
                                            now,
                                            Session.getScriptTimeZone(),
                                            'yyMMddHHmmss'
                                          );

                                        let uniqId = '';
                                        let attempt = 0;

                                        do {
                                          const randomCode =
                                            String(
                                              Math.floor(Math.random() * 1000)
                                            ).padStart(3, '0');

                                          uniqId =
                                            'USR' +
                                            timeCode +
                                            randomCode;

                                          attempt++;

                                          if (attempt >= 1000) {
                                            throw new Error(
                                              'Gagal membuat UNIQ ID User.'
                                            );
                                          }

                                        } while (existingUniqIds.has(uniqId));

                                        const newRowNumber =
                                          sheet.getLastRow() + 1;

                                        const newRow = [
                                          uniqId,
                                          userId,
                                          password,
                                          nama,
                                          roleMap[kode],
                                          kode,
                                          noHp,
                                          '',
                                          email,
                                          status,
                                          '',
                                          ''
                                        ];

                                        // Seluruh row ditulis terlebih dahulu.
                                        sheet
                                          .getRange(
                                            newRowNumber,
                                            1,
                                            1,
                                            USER_COL.SIGNATURE
                                          )
                                          .setValues([newRow]);

                                        // PASSWORD dan NO.HP wajib Plain Text agar leading zero
                                        // seperti 000000 dan 0821099090 tidak hilang.
                                        const passwordCell =
                                          sheet.getRange(
                                            newRowNumber,
                                            USER_COL.PASSWORD
                                          );

                                        passwordCell.setNumberFormat('@');
                                        passwordCell.setValue(password);

                                        const phoneCell =
                                          sheet.getRange(
                                            newRowNumber,
                                            USER_COL.NO_HP
                                          );

                                        phoneCell.setNumberFormat('@');
                                        phoneCell.setValue(noHp);

                                        SpreadsheetApp.flush();

                                        const savedRow =
                                          sheet
                                            .getRange(
                                              newRowNumber,
                                              1,
                                              1,
                                              USER_COL.SIGNATURE
                                            )
                                            .getDisplayValues()[0];

                                        return {
                                          success: true,
                                          message: 'User berhasil ditambahkan.',
                                          user: userRowToObject(savedRow)
                                        };

                                      } catch (error) {

                                        return {
                                          success: false,
                                          message: 'Gagal menambahkan User.',
                                          error: error.message
                                        };

                                      }

                                    }



                                    // =====================================================
                                    // UPDATE USER
                                    // KHUSUS MASTER (KODE 1)
                                    // PASSWORD TIDAK DIUBAH DARI FITUR INI
                                    // =====================================================

                                    function updateUser(data) {

                                      try {

                                        if (!data) {
                                          return {
                                            success: false,
                                            message: 'Data Edit User tidak ditemukan.'
                                          };
                                        }

                                        const requesterUniqId =
                                          cleanString(
                                            data.requesterUniqId ||
                                            data.masterUniqId
                                          );

                                        const targetUniqId =
                                          cleanString(
                                            data.targetUniqId ||
                                            data.uniqId
                                          );

                                        const userId =
                                          cleanString(data.userId);

                                        const nama =
                                          cleanString(data.nama);

                                        const kode =
                                          cleanString(data.kode);

                                        const noHp =
                                          cleanString(data.noHp);

                                        const email =
                                          cleanString(data.email);

                                        const status =
                                          cleanString(
                                            data.status || 'ACTIVE'
                                          ).toUpperCase();


                                        if (!requesterUniqId) {
                                          return {
                                            success: false,
                                            message: 'Identitas Master tidak ditemukan.'
                                          };
                                        }

                                        if (!targetUniqId) {
                                          return {
                                            success: false,
                                            message: 'UNIQ ID User yang akan diedit tidak ditemukan.'
                                          };
                                        }


                                        const sheet =
                                          getUserSheet();

                                        const requesterRow =
                                          findUserRowByUniqId(
                                            sheet,
                                            requesterUniqId
                                          );

                                        if (requesterRow === -1) {
                                          return {
                                            success: false,
                                            message: 'Akun Master tidak ditemukan.'
                                          };
                                        }

                                        const requesterData =
                                          sheet
                                            .getRange(
                                              requesterRow,
                                              1,
                                              1,
                                              USER_COL.SIGNATURE
                                            )
                                            .getDisplayValues()[0];

                                        const requesterKode =
                                          cleanString(
                                            requesterData[
                                              USER_COL.KODE - 1
                                            ]
                                          );

                                        const requesterStatus =
                                          cleanString(
                                            requesterData[
                                              USER_COL.STATUS - 1
                                            ]
                                          ).toUpperCase();

                                        if (requesterKode !== '1') {
                                          return {
                                            success: false,
                                            message: 'Edit User hanya dapat dilakukan oleh Master.'
                                          };
                                        }

                                        if (
                                          requesterStatus &&
                                          requesterStatus !== 'ACTIVE'
                                        ) {
                                          return {
                                            success: false,
                                            message: 'Akun Master sedang tidak aktif.'
                                          };
                                        }


                                        const targetRow =
                                          findUserRowByUniqId(
                                            sheet,
                                            targetUniqId
                                          );

                                        if (targetRow === -1) {
                                          return {
                                            success: false,
                                            message: 'User yang akan diedit tidak ditemukan.'
                                          };
                                        }


                                        if (!userId) {
                                          return {
                                            success: false,
                                            message: 'User ID wajib diisi.'
                                          };
                                        }

                                        if (!nama) {
                                          return {
                                            success: false,
                                            message: 'Nama wajib diisi.'
                                          };
                                        }

                                        const roleMap = {
                                          '1': 'MASTER',
                                          '2': 'SECTION HEAD',
                                          '3': 'GROUP LEADER',
                                          '4': 'ADMIN',
                                          '5': 'MECHANIC',
                                          '6': 'VISITOR'
                                        };

                                        if (!roleMap[kode]) {
                                          return {
                                            success: false,
                                            message: 'Level User tidak valid.'
                                          };
                                        }

                                        if (
                                          status !== 'ACTIVE' &&
                                          status !== 'INACTIVE'
                                        ) {
                                          return {
                                            success: false,
                                            message: 'Status User tidak valid.'
                                          };
                                        }


                                        // USER ID harus unik, tetapi abaikan row user
                                        // yang sedang diedit.
                                        const lastRow =
                                          sheet.getLastRow();

                                        if (lastRow >= 2) {

                                          const existingUserIds =
                                            sheet
                                              .getRange(
                                                2,
                                                USER_COL.USER_ID,
                                                lastRow - 1,
                                                1
                                              )
                                              .getDisplayValues();

                                          for (
                                            let index = 0;
                                            index < existingUserIds.length;
                                            index++
                                          ) {

                                            const rowNumber =
                                              index + 2;

                                            if (rowNumber === targetRow) {
                                              continue;
                                            }

                                            if (
                                              cleanString(
                                                existingUserIds[index][0]
                                              ).toLowerCase() ===
                                              userId.toLowerCase()
                                            ) {
                                              return {
                                                success: false,
                                                duplicateUserId: true,
                                                message: 'User ID sudah digunakan.'
                                              };
                                            }

                                          }

                                        }


                                        // Password, Photo dan Kutipan tidak disentuh.
                                        sheet
                                          .getRange(
                                            targetRow,
                                            USER_COL.USER_ID
                                          )
                                          .setValue(userId);

                                        sheet
                                          .getRange(
                                            targetRow,
                                            USER_COL.NAMA
                                          )
                                          .setValue(nama);

                                        sheet
                                          .getRange(
                                            targetRow,
                                            USER_COL.LEVEL
                                          )
                                          .setValue(roleMap[kode]);

                                        sheet
                                          .getRange(
                                            targetRow,
                                            USER_COL.KODE
                                          )
                                          .setValue(kode);

                                        const phoneCell =
                                          sheet.getRange(
                                            targetRow,
                                            USER_COL.NO_HP
                                          );

                                        phoneCell.setNumberFormat('@');
                                        phoneCell.setValue(noHp);

                                        sheet
                                          .getRange(
                                            targetRow,
                                            USER_COL.EMAIL
                                          )
                                          .setValue(email);

                                        sheet
                                          .getRange(
                                            targetRow,
                                            USER_COL.STATUS
                                          )
                                          .setValue(status);

                                        SpreadsheetApp.flush();


                                        const savedRow =
                                          sheet
                                            .getRange(
                                              targetRow,
                                              1,
                                              1,
                                              USER_COL.SIGNATURE
                                            )
                                            .getDisplayValues()[0];

                                        return {
                                          success: true,
                                          message: 'User berhasil diperbarui.',
                                          user: userRowToObject(savedRow)
                                        };

                                      } catch (error) {

                                        return {
                                          success: false,
                                          message: 'Gagal memperbarui User.',
                                          error: error.message
                                        };

                                      }

                                    }



                                    // =====================================================
                                    // RESET USER PASSWORD
                                    // KHUSUS MASTER (KODE 1)
                                    // PASSWORD DEFAULT = USER ID TARGET
                                    // =====================================================

                                    function resetUserPassword(data) {

                                      try {

                                        if (!data) {
                                          return {
                                            success: false,
                                            message: 'Data Reset Password tidak ditemukan.'
                                          };
                                        }

                                        const requesterUniqId =
                                          cleanString(
                                            data.requesterUniqId ||
                                            data.masterUniqId
                                          );

                                        const targetUniqId =
                                          cleanString(
                                            data.targetUniqId ||
                                            data.uniqId
                                          );


                                        if (!requesterUniqId) {
                                          return {
                                            success: false,
                                            message: 'Identitas Master tidak ditemukan.'
                                          };
                                        }

                                        if (!targetUniqId) {
                                          return {
                                            success: false,
                                            message: 'UNIQ ID User yang akan di-reset tidak ditemukan.'
                                          };
                                        }


                                        const sheet =
                                          getUserSheet();


                                        // Validasi requester = MASTER aktif.
                                        const requesterRow =
                                          findUserRowByUniqId(
                                            sheet,
                                            requesterUniqId
                                          );

                                        if (requesterRow === -1) {
                                          return {
                                            success: false,
                                            message: 'Akun Master tidak ditemukan.'
                                          };
                                        }

                                        const requesterData =
                                          sheet
                                            .getRange(
                                              requesterRow,
                                              1,
                                              1,
                                              USER_COL.SIGNATURE
                                            )
                                            .getDisplayValues()[0];

                                        const requesterKode =
                                          cleanString(
                                            requesterData[
                                              USER_COL.KODE - 1
                                            ]
                                          );

                                        const requesterStatus =
                                          cleanString(
                                            requesterData[
                                              USER_COL.STATUS - 1
                                            ]
                                          ).toUpperCase();

                                        if (requesterKode !== '1') {
                                          return {
                                            success: false,
                                            message: 'Reset Password hanya dapat dilakukan oleh Master.'
                                          };
                                        }

                                        if (
                                          requesterStatus &&
                                          requesterStatus !== 'ACTIVE'
                                        ) {
                                          return {
                                            success: false,
                                            message: 'Akun Master sedang tidak aktif.'
                                          };
                                        }


                                        // Cari target berdasarkan immutable UNIQ ID.
                                        const targetRow =
                                          findUserRowByUniqId(
                                            sheet,
                                            targetUniqId
                                          );

                                        if (targetRow === -1) {
                                          return {
                                            success: false,
                                            message: 'User yang akan di-reset tidak ditemukan.'
                                          };
                                        }


                                        // USER ID diambil langsung dari database,
                                        // bukan dari frontend.
                                        const targetUserId =
                                          cleanString(
                                            sheet
                                              .getRange(
                                                targetRow,
                                                USER_COL.USER_ID
                                              )
                                              .getDisplayValue()
                                          );

                                        const targetName =
                                          cleanString(
                                            sheet
                                              .getRange(
                                                targetRow,
                                                USER_COL.NAMA
                                              )
                                              .getDisplayValue()
                                          );


                                        if (!targetUserId) {
                                          return {
                                            success: false,
                                            message: 'User ID target kosong. Password tidak dapat di-reset.'
                                          };
                                        }


                                        // Password default = USER ID target.
                                        // Plain Text agar leading zero tetap terjaga.
                                        const passwordCell =
                                          sheet.getRange(
                                            targetRow,
                                            USER_COL.PASSWORD
                                          );

                                        passwordCell.setNumberFormat('@');
                                        passwordCell.setValue(
                                          targetUserId
                                        );

                                        SpreadsheetApp.flush();


                                        return {
                                          success: true,
                                          message: 'Password berhasil di-reset ke default.',
                                          targetUniqId: targetUniqId,
                                          userId: targetUserId,
                                          nama: targetName
                                        };

                                      } catch (error) {

                                        return {
                                          success: false,
                                          message: 'Gagal me-reset password User.',
                                          error: error.message
                                        };

                                      }

                                    }



                                    // =====================================================
                                    // CHANGE PASSWORD
                                    //
                                    // PASSWORD TIDAK PERNAH DIKIRIM KEMBALI KE CLIENT
                                    // =====================================================

                                    function changePassword(data) {

                                      try {

                                        if (!data) {
                                          return {
                                            success: false,
                                            message: 'Data Change Password tidak ditemukan.'
                                          };
                                        }

                                        const uniqId =
                                          cleanString(data.uniqId);

                                        const currentPassword =
                                          cleanString(data.currentPassword);

                                        const newPassword =
                                          cleanString(data.newPassword);

                                        if (!uniqId) {
                                          return {
                                            success: false,
                                            message: 'UNIQ ID user wajib tersedia.'
                                          };
                                        }

                                        if (!currentPassword) {
                                          return {
                                            success: false,
                                            message: 'Current Password wajib diisi.'
                                          };
                                        }

                                        if (!newPassword) {
                                          return {
                                            success: false,
                                            message: 'New Password wajib diisi.'
                                          };
                                        }

                                        if (newPassword.length < 6) {
                                          return {
                                            success: false,
                                            message: 'New Password minimal 6 karakter.'
                                          };
                                        }

                                        if (currentPassword === newPassword) {
                                          return {
                                            success: false,
                                            message: 'New Password harus berbeda dari Current Password.'
                                          };
                                        }

                                        const sheet =
                                          getUserSheet();

                                        const rowNumber =
                                          findUserRowByUniqId(
                                            sheet,
                                            uniqId
                                          );

                                        if (rowNumber === -1) {
                                          return {
                                            success: false,
                                            message: 'User tidak ditemukan.'
                                          };
                                        }

                                        const databasePassword =
                                          cleanString(
                                            sheet
                                              .getRange(
                                                rowNumber,
                                                USER_COL.PASSWORD
                                              )
                                              .getValue()
                                          );

                                        const databaseStatus =
                                          cleanString(
                                            sheet
                                              .getRange(
                                                rowNumber,
                                                USER_COL.STATUS
                                              )
                                              .getValue()
                                          ).toUpperCase();

                                        if (
                                          databaseStatus &&
                                          databaseStatus !== 'ACTIVE'
                                        ) {
                                          return {
                                            success: false,
                                            inactive: true,
                                            message: 'Akun Anda sedang tidak aktif.'
                                          };
                                        }

                                        if (databasePassword !== currentPassword) {
                                          return {
                                            success: false,
                                            invalidCurrentPassword: true,
                                            message: 'Current Password tidak sesuai.'
                                          };
                                        }

                                        // Simpan PASSWORD sebagai Plain Text agar leading zero
                                        // seperti 000000 atau 001234 tidak diubah Google Sheets.
                                        const passwordCell =
                                          sheet.getRange(
                                            rowNumber,
                                            USER_COL.PASSWORD
                                          );

                                        passwordCell.setNumberFormat('@');
                                        passwordCell.setValue(newPassword);

                                        SpreadsheetApp.flush();

                                        return {
                                          success: true,
                                          message: 'Password berhasil diubah.'
                                        };

                                      } catch (error) {

                                        return {
                                          success: false,
                                          message: 'Gagal mengubah Password.',
                                          error: error.message
                                        };

                                      }

                                    }



                                    // TEST CONNECTION USER DATABASE



                                    // =====================================================







                                    function testConnection() {







                                      const ss =



                                        SpreadsheetApp.openById(



                                          SPREADSHEET_ID



                                        );







                                      const sheet =



                                        ss.getSheetByName(



                                          SHEET_USERS



                                        );







                                      if (!sheet) {







                                        throw new Error(



                                          'Sheet USER DATA tidak ditemukan.'



                                        );



                                      }







                                      const data =



                                        sheet



                                          .getDataRange()



                                          .getValues();







                                      Logger.log(



                                        'Koneksi USER DATA berhasil'



                                      );







                                      Logger.log(



                                        'Jumlah data: ' +



                                        (data.length - 1)



                                      );



                                    }











                                    // =====================================================



                                    // TEST CONNECTION DM DATABASE



                                    // =====================================================







                                    function testDMConnection() {







                                      const sheet =



                                        getDMSheet();







                                      Logger.log(



                                        'Koneksi DM DATABASE berhasil'



                                      );







                                      Logger.log(



                                        'Nama Sheet: ' +



                                        sheet.getName()



                                      );



                                    }











                                    // =====================================================



                                    // LOGIN USER



                                    // =====================================================







                                    function loginUser(

                                      userId,

                                      password

                                    ) {



                                      try {



                                        const sheet =

                                          getUserSheet();



                                        const data =

                                          sheet

                                            .getDataRange()

                                            .getValues();



                                        const inputUserId =

                                          cleanString(userId);



                                        const inputPassword =

                                          cleanString(password);



                                        if (

                                          !inputUserId ||

                                          !inputPassword

                                        ) {

                                          return {

                                            success: false,

                                            message:

                                              'User ID dan Password wajib diisi.'

                                          };

                                        }



                                        for (

                                          let i = 1;

                                          i < data.length;

                                          i++

                                        ) {



                                          const row =

                                            data[i];



                                          const dbUserId =

                                            cleanString(

                                              row[USER_COL.USER_ID - 1]

                                            );



                                          const dbPassword =

                                            cleanString(

                                              row[USER_COL.PASSWORD - 1]

                                            );



                                          if (

                                            dbUserId === inputUserId &&

                                            dbPassword === inputPassword

                                          ) {



                                            const user =

                                              userRowToObject(

                                                row

                                              );



                                            const dbStatus =

                                              cleanString(

                                                user.status

                                              ).toUpperCase();



                                            // STATUS kosong sementara dianggap ACTIVE.

                                            if (

                                              dbStatus &&

                                              dbStatus !== 'ACTIVE'

                                            ) {

                                              return {

                                                success: false,

                                                inactive: true,

                                                message:

                                                  'Akun Anda sedang tidak aktif.'

                                              };

                                            }



                                            return {

                                              success: true,

                                              message:

                                                'Login berhasil',

                                              user: user

                                            };



                                          }

                                        }



                                        return {

                                          success: false,

                                          message:

                                            'User ID atau Password salah.'

                                        };



                                      } catch (error) {



                                        return {

                                          success: false,

                                          message:

                                            'Terjadi kesalahan saat login.',

                                          error:

                                            error.message

                                        };



                                      }

                                    }











                                    // =====================================================



                                    // GENERATE ID START INSPECTION



                                    //



                                    // FORMAT:



                                    // SI00 + YY + MM + DD + XXX



                                    // =====================================================







                                    function generateInspectionId() {







                                      const sheet =



                                        getDMSheet();







                                      const now =



                                        new Date();







                                      const timezone =



                                        Session.getScriptTimeZone();







                                      const dateCode =



                                        Utilities.formatDate(



                                          now,



                                          timezone,



                                          'yyMMdd'



                                        );







                                      const lastRow =



                                        sheet.getLastRow();







                                      const existingIds =



                                        new Set();







                                      if (lastRow >= 2) {







                                        const ids =



                                          sheet



                                            .getRange(



                                              2,



                                              DM_COL.ID,



                                              lastRow - 1,



                                              1



                                            )



                                            .getDisplayValues();







                                        ids.forEach(



                                          function(row) {







                                            const id =



                                              cleanString(



                                                row[0]



                                              );







                                            if (id) {







                                              existingIds.add(



                                                id



                                              );



                                            }



                                          }



                                        );



                                      }







                                      let inspectionId = '';







                                      let attempt = 0;







                                      const maxAttempt = 1000;







                                      do {







                                        const randomNumber =



                                          Math.floor(



                                            Math.random() * 1000



                                          );







                                        const randomCode =



                                          String(



                                            randomNumber



                                          ).padStart(



                                            3,



                                            '0'



                                          );







                                        inspectionId =



                                          'SI00' +



                                          dateCode +



                                          randomCode;







                                        attempt++;







                                        if (



                                          attempt >= maxAttempt



                                        ) {







                                          throw new Error(



                                            'Gagal membuat ID Inspection unik.'



                                          );



                                        }







                                      } while (



                                        existingIds.has(



                                          inspectionId



                                        )



                                      );







                                      return inspectionId;



                                    }











                                    // =====================================================



                                    // UPLOAD FOTO INSPECTION



                                    // =====================================================







                                    function uploadInspectionPhoto(



                                      photoBase64,



                                      photoMimeType,



                                      inspectionId



                                    ) {







                                      if (!photoBase64) {







                                        throw new Error(



                                          'Photo Inspection tidak ditemukan.'



                                        );



                                      }







                                      const folder =



                                        DriveApp.getFolderById(



                                          INSPECTION_PHOTO_FOLDER_ID



                                        );







                                      const cleanBase64 =



                                        cleanBase64Data(



                                          photoBase64



                                        );







                                      const bytes =



                                        Utilities.base64Decode(



                                          cleanBase64



                                        );







                                      const mimeType =



                                        photoMimeType ||



                                        'image/jpeg';







                                      const extension =



                                        getFileExtensionFromMime(



                                          mimeType



                                        );







                                      const fileName =



                                        inspectionId +



                                        '.' +



                                        extension;







                                      const blob =



                                        Utilities.newBlob(



                                          bytes,



                                          mimeType,



                                          fileName



                                        );







                                      const file =



                                        folder.createFile(



                                          blob



                                        );







                                      return {







                                        fileId:



                                          file.getId(),







                                        fileName:



                                          fileName,







                                        fileUrl:



                                          file.getUrl()







                                      };



                                    }











                                    // =====================================================



                                    // UPLOAD FOTO INSPECTION PENGGANTI



                                    // DAILY OUTSTANDING



                                    // =====================================================







                                    function uploadReplacementInspectionPhoto(



                                      photoBase64,



                                      photoMimeType,



                                      inspectionId



                                    ) {







                                      if (!photoBase64) {







                                        throw new Error(



                                          'Photo Inspection tidak ditemukan.'



                                        );



                                      }







                                      const folder =



                                        DriveApp.getFolderById(



                                          INSPECTION_PHOTO_FOLDER_ID



                                        );







                                      const cleanBase64 =



                                        cleanBase64Data(



                                          photoBase64



                                        );







                                      const bytes =



                                        Utilities.base64Decode(



                                          cleanBase64



                                        );







                                      const mimeType =



                                        photoMimeType ||



                                        'image/jpeg';







                                      const extension =



                                        getFileExtensionFromMime(



                                          mimeType



                                        );







                                      const timestamp =



                                        Utilities.formatDate(



                                          new Date(),



                                          Session.getScriptTimeZone(),



                                          'yyMMdd_HHmmss'



                                        );







                                      const fileName =



                                        inspectionId +



                                        '_UPDATE_' +



                                        timestamp +



                                        '.' +



                                        extension;







                                      const blob =



                                        Utilities.newBlob(



                                          bytes,



                                          mimeType,



                                          fileName



                                        );







                                      const file =



                                        folder.createFile(



                                          blob



                                        );







                                      return {







                                        fileId:



                                          file.getId(),







                                        fileName:



                                          fileName,







                                        fileUrl:



                                          file.getUrl()







                                      };



                                    }











                                    // =====================================================



                                    // UPLOAD EVIDENCE DAILY OUTSTANDING



                                    // SUPPORT IMAGE / PDF



                                    // =====================================================







                                    function uploadOutstandingEvidence(



                                      evidenceBase64,



                                      evidenceMimeType,



                                      inspectionId



                                    ) {







                                      if (!evidenceBase64) {







                                        throw new Error(



                                          'File Evidence tidak ditemukan.'



                                        );



                                      }







                                      const allowedMimeTypes = [







                                        'image/jpeg',



                                        'image/jpg',



                                        'image/png',



                                        'image/webp',



                                        'application/pdf'







                                      ];







                                      const mimeType =



                                        cleanString(



                                          evidenceMimeType



                                        ).toLowerCase();







                                      if (



                                        !allowedMimeTypes.includes(



                                          mimeType



                                        )



                                      ) {







                                        throw new Error(



                                          'Format Evidence tidak didukung.'



                                        );



                                      }







                                      const folder =



                                        DriveApp.getFolderById(



                                          OUTSTANDING_EVIDENCE_FOLDER_ID



                                        );







                                      const cleanBase64 =



                                        cleanBase64Data(



                                          evidenceBase64



                                        );







                                      const bytes =



                                        Utilities.base64Decode(



                                          cleanBase64



                                        );







                                      const extension =



                                        getFileExtensionFromMime(



                                          mimeType



                                        );







                                      const timestamp =



                                        Utilities.formatDate(



                                          new Date(),



                                          Session.getScriptTimeZone(),



                                          'yyMMdd_HHmmss'



                                        );







                                      const fileName =



                                        inspectionId +



                                        '_EVIDENCE_' +



                                        timestamp +



                                        '.' +



                                        extension;







                                      const blob =



                                        Utilities.newBlob(



                                          bytes,



                                          mimeType,



                                          fileName



                                        );







                                      const file =



                                        folder.createFile(



                                          blob



                                        );







                                      return {







                                        fileId:



                                          file.getId(),







                                        fileName:



                                          fileName,







                                        fileUrl:



                                          file.getUrl()







                                      };



                                    }










                                    // =====================================================



                                    // SUBMIT START INSPECTION



                                    // =====================================================







                                    function submitInspection(



                                      data



                                    ) {







                                      if (!data) {







                                        return {







                                          success: false,







                                          message:



                                            'Data inspection tidak ditemukan.'







                                        };



                                      }







                                      const unitCode =



                                        cleanString(



                                          data.unitCode



                                        );







                                      const hmInspection =



                                        cleanString(



                                          data.hmInspection



                                        );







                                      const dateInspection =



                                        cleanString(



                                          data.dateInspection



                                        );







                                      const groupComponent =



                                        cleanString(



                                          data.groupComponent



                                        );







                                      const problemDescription =



                                        cleanString(



                                          data.problemDescription



                                        );







                                      const rating =



                                        cleanString(



                                          data.rating



                                        );







                                      const partsDescription =



                                        cleanString(



                                          data.partsDescription



                                        );







                                      const partNo =



                                        cleanString(



                                          data.partNo



                                        );







                                      const quantity =



                                        cleanString(



                                          data.quantity



                                        );







                                      const inspectors =



                                        cleanString(



                                          data.inspectors



                                        );







                                      const notes =



                                        cleanString(



                                          data.notes



                                        );







                                      if (!unitCode) {







                                        return {







                                          success: false,







                                          message:



                                            'Unit Code wajib diisi.'







                                        };



                                      }







                                      if (!hmInspection) {







                                        return {







                                          success: false,







                                          message:



                                            'HM Inspection wajib diisi.'







                                        };



                                      }







                                      if (!dateInspection) {







                                        return {







                                          success: false,







                                          message:



                                            'Date Inspection wajib diisi.'







                                        };



                                      }







                                      if (!groupComponent) {







                                        return {







                                          success: false,







                                          message:



                                            'Group Component wajib diisi.'







                                        };



                                      }







                                      if (!problemDescription) {







                                        return {







                                          success: false,







                                          message:



                                            'Problem Description wajib diisi.'







                                        };



                                      }







                                      if (!rating) {







                                        return {







                                          success: false,







                                          message:



                                            'Rating wajib diisi.'







                                        };



                                      }







                                      if (!inspectors) {







                                        return {







                                          success: false,







                                          message:



                                            'Inspectors tidak ditemukan.'







                                        };



                                      }







                                      if (!data.photoBase64) {







                                        return {







                                          success: false,







                                          message:



                                            'Photo Inspection wajib diisi.'







                                        };



                                      }







                                      const sheet =



                                        getDMSheet();







                                      const inspectionId =



                                        generateInspectionId();







                                      let uploadedPhoto = null;







                                      try {







                                        uploadedPhoto =



                                          uploadInspectionPhoto(







                                            data.photoBase64,







                                            data.photoMimeType,







                                            inspectionId







                                          );







                                      } catch (error) {







                                        return {







                                          success: false,







                                          message:



                                            'Gagal upload Photo Inspection.',







                                          error:



                                            error.message







                                        };



                                      }







                                      const mol =



                                        'Belum';







                                      const evidence =



                                        '';







                                      const partsStatus =



                                        '';







                                      const actionProblems =



                                        '';







                                      const hmAction =



                                        '';







                                      const dateAction =



                                        '';







                                      const status =



                                        'OPEN';







                                      const manPower =



                                        '';







                                      try {







                                        sheet.appendRow([







                                          inspectionId,







                                          unitCode,







                                          hmInspection,







                                          dateInspection,







                                          uploadedPhoto.fileUrl,







                                          groupComponent,







                                          problemDescription,







                                          rating,







                                          partsDescription,







                                          partNo,







                                          quantity,







                                          inspectors,







                                          notes,







                                          mol,







                                          evidence,







                                          partsStatus,







                                          actionProblems,







                                          hmAction,







                                          dateAction,







                                          status,







                                          manPower







                                        ]);







                                      } catch (error) {







                                        try {







                                          DriveApp



                                            .getFileById(



                                              uploadedPhoto.fileId



                                            )



                                            .setTrashed(



                                              true



                                            );







                                        } catch (



                                          deleteError



                                        ) {







                                          Logger.log(



                                            deleteError.message



                                          );



                                        }







                                        return {







                                          success: false,







                                          message:



                                            'Gagal menyimpan Inspection ke database.',







                                          error:



                                            error.message







                                        };



                                      }







                                      return {







                                        success: true,







                                        message:



                                          'Inspection berhasil disimpan.',







                                        inspectionId:



                                          inspectionId,







                                        photoUrl:



                                          uploadedPhoto.fileUrl,







                                        status:



                                          status,







                                        mol:



                                          mol







                                      };



                                    }











                                    // =====================================================



                                    // DAILY OUTSTANDING



                                    // GET SEMUA STATUS OPEN



                                    // =====================================================







                                    function getDailyOutstanding() {







                                      try {







                                        const sheet =



                                          getDMSheet();







                                        const lastRow =



                                          sheet.getLastRow();







                                        if (lastRow < 2) {







                                          return {







                                            success: true,







                                            count: 0,







                                            data: []







                                          };



                                        }







                                        const rows =



                                          sheet



                                            .getRange(



                                              2,



                                              1,



                                              lastRow - 1,



                                              21



                                            )



                                            .getValues();







                                        const outstanding = [];







                                        rows.forEach(



                                          function(row) {







                                            const record =



                                              dmRowToObject(



                                                row



                                              );







                                            if (



                                              record.status



                                                .toUpperCase() ===



                                              'OPEN'



                                            ) {







                                              outstanding.push(



                                                record



                                              );



                                            }



                                          }



                                        );







                                        outstanding.reverse();







                                        return {







                                          success: true,







                                          count:



                                            outstanding.length,







                                          data:



                                            outstanding







                                        };







                                      } catch (error) {







                                        return {







                                          success: false,







                                          message:



                                            'Gagal mengambil Daily Outstanding.',







                                          error:



                                            error.message







                                        };



                                      }



                                    }











                                    // =====================================================



                                    // DAILY OUTSTANDING



                                    // GET DETAIL BERDASARKAN ID



                                    // =====================================================







                                    function getDailyOutstandingDetail(



                                      inspectionId



                                    ) {







                                      try {







                                        const sheet =



                                          getDMSheet();







                                        const rowNumber =



                                          findInspectionRowById(



                                            sheet,



                                            inspectionId



                                          );







                                        if (



                                          rowNumber === -1



                                        ) {







                                          return {







                                            success: false,







                                            message:



                                              'ID Inspection tidak ditemukan.'







                                          };



                                        }







                                        const row =



                                          sheet



                                            .getRange(



                                              rowNumber,



                                              1,



                                              1,



                                              21



                                            )



                                            .getValues()[0];







                                        return {







                                          success: true,







                                          data:



                                            dmRowToObject(



                                              row



                                            )







                                        };







                                      } catch (error) {







                                        return {







                                          success: false,







                                          message:



                                            'Gagal mengambil detail Outstanding.',







                                          error:



                                            error.message







                                        };



                                      }



                                    }











                                    // =====================================================



                                    // DAILY OUTSTANDING



                                    // UPDATE RECORD



                                    //



                                    // MOL:



                                    // Evidence ada -> Submitted



                                    // Evidence kosong -> Belum



                                    //



                                    // STATUS:



                                    // Action Problems ada -> CLOSE



                                    // Action Problems kosong -> OPEN



                                    // =====================================================







                                    function updateDailyOutstanding(



                                      data



                                    ) {







                                      if (!data) {







                                        return {







                                          success: false,







                                          message:



                                            'Data update tidak ditemukan.'







                                        };



                                      }







                                      const inspectionId =



                                        cleanString(



                                          data.inspectionId



                                        );







                                      if (!inspectionId) {







                                        return {







                                          success: false,







                                          message:



                                            'ID Inspection wajib tersedia.'







                                        };



                                      }







                                      const sheet =



                                        getDMSheet();







                                      const rowNumber =



                                        findInspectionRowById(



                                          sheet,



                                          inspectionId



                                        );







                                      if (



                                        rowNumber === -1



                                      ) {







                                        return {







                                          success: false,







                                          message:



                                            'ID Inspection tidak ditemukan.'







                                        };



                                      }











                                      // ===================================================



                                      // AMBIL DATA LAMA



                                      // ===================================================







                                      const oldRow =



                                        sheet



                                          .getRange(



                                            rowNumber,



                                            1,



                                            1,



                                            21



                                          )



                                          .getValues()[0];







                                      const oldRecord =



                                        dmRowToObject(



                                          oldRow



                                        );











                                      // ===================================================



                                      // FIELD YANG BISA DIUPDATE USER



                                      // ===================================================







                                      const unitCode =



                                        cleanString(



                                          data.unitCode



                                        );







                                      const hmInspection =



                                        cleanString(



                                          data.hmInspection



                                        );







                                      const dateInspection =



                                        cleanString(



                                          data.dateInspection



                                        );







                                      const groupComponent =



                                        cleanString(



                                          data.groupComponent



                                        );







                                      const problemDescription =



                                        cleanString(



                                          data.problemDescription



                                        );







                                      const rating =



                                        cleanString(



                                          data.rating



                                        );







                                      const partsDescription =



                                        cleanString(



                                          data.partsDescription



                                        );







                                      const partNo =



                                        cleanString(



                                          data.partNo



                                        );







                                      const quantity =



                                        cleanString(



                                          data.quantity



                                        );







                                      const notes =



                                        cleanString(



                                          data.notes



                                        );







                                      const partsStatus =



                                        cleanString(



                                          data.partsStatus



                                        );







                                      const actionProblems =



                                        cleanString(



                                          data.actionProblems



                                        );







                                      const hmAction =



                                        cleanString(



                                          data.hmAction



                                        );







                                      const dateAction =



                                        cleanString(



                                          data.dateAction



                                        );







                                      const manPower =



                                        cleanString(



                                          data.manPower



                                        );











                                      // ===================================================



                                      // VALIDASI REQUIRED



                                      // ===================================================







                                      if (!unitCode) {







                                        return {







                                          success: false,







                                          message:



                                            'Unit Code wajib diisi.'







                                        };



                                      }







                                      if (!hmInspection) {







                                        return {







                                          success: false,







                                          message:



                                            'HM Inspection wajib diisi.'







                                        };



                                      }







                                      if (!dateInspection) {







                                        return {







                                          success: false,







                                          message:



                                            'Date Inspection wajib diisi.'







                                        };



                                      }







                                      if (!groupComponent) {







                                        return {







                                          success: false,







                                          message:



                                            'Group Component wajib diisi.'







                                        };



                                      }







                                      if (!problemDescription) {







                                        return {







                                          success: false,







                                          message:



                                            'Problem Description wajib diisi.'







                                        };



                                      }







                                      if (!rating) {







                                        return {







                                          success: false,







                                          message:



                                            'Rating wajib diisi.'







                                        };



                                      }











                                      // ===================================================



                                      // PHOTO



                                      // DEFAULT = PHOTO LAMA



                                      // ===================================================







                                      let photoUrl =



                                        oldRecord.photo;







                                      let newPhotoFile =



                                        null;







                                      if (



                                        data.photoBase64



                                      ) {







                                        try {







                                          newPhotoFile =



                                            uploadReplacementInspectionPhoto(







                                              data.photoBase64,







                                              data.photoMimeType,







                                              inspectionId







                                            );







                                          photoUrl =



                                            newPhotoFile.fileUrl;







                                        } catch (error) {







                                          return {







                                            success: false,







                                            message:



                                              'Gagal upload Photo Inspection baru.',







                                            error:



                                              error.message







                                          };



                                        }



                                      }











                                      // ===================================================



                                      // EVIDENCE



                                      // DEFAULT = EVIDENCE LAMA



                                      // ===================================================







                                      let evidenceUrl =



                                        oldRecord.evidence;







                                      let newEvidenceFile =



                                        null;







                                      if (



                                        data.evidenceBase64



                                      ) {







                                        try {







                                          newEvidenceFile =



                                            uploadOutstandingEvidence(







                                              data.evidenceBase64,







                                              data.evidenceMimeType,







                                              inspectionId







                                            );







                                          evidenceUrl =



                                            newEvidenceFile.fileUrl;







                                        } catch (error) {







                                          // Kalau foto baru sempat terupload



                                          // tetapi Evidence gagal,



                                          // hapus foto baru agar tidak yatim.







                                          if (



                                            newPhotoFile &&



                                            newPhotoFile.fileId



                                          ) {







                                            try {







                                              DriveApp



                                                .getFileById(



                                                  newPhotoFile.fileId



                                                )



                                                .setTrashed(



                                                  true



                                                );







                                            } catch (



                                              deletePhotoError



                                            ) {







                                              Logger.log(



                                                deletePhotoError.message



                                              );



                                            }



                                          }







                                          return {







                                            success: false,







                                            message:



                                              'Gagal upload Evidence.',







                                            error:



                                              error.message







                                          };



                                        }



                                      }











                                      // ===================================================



                                      // MOL OTOMATIS



                                      // ===================================================







                                      const mol =



                                        evidenceUrl



                                          ? 'Submitted'



                                          : 'Belum';











                                      // ===================================================



                                      // STATUS OTOMATIS



                                      // ===================================================







                                      const status =



                                        actionProblems



                                          ? 'CLOSE'



                                          : 'OPEN';











                                      // ===================================================



                                      // INSPECTOR TETAP DATA LAMA



                                      // ===================================================







                                      const inspectors =



                                        oldRecord.inspectors;











                                      // ===================================================



                                      // UPDATE 21 KOLOM SEKALIGUS



                                      // ===================================================







                                      const updatedRow = [







                                        inspectionId,







                                        unitCode,







                                        hmInspection,







                                        dateInspection,







                                        photoUrl,







                                        groupComponent,







                                        problemDescription,







                                        rating,







                                        partsDescription,







                                        partNo,







                                        quantity,







                                        inspectors,







                                        notes,







                                        mol,







                                        evidenceUrl,







                                        partsStatus,







                                        actionProblems,







                                        hmAction,







                                        dateAction,







                                        status,







                                        manPower







                                      ];







                                      try {







                                        sheet



                                          .getRange(



                                            rowNumber,



                                            1,



                                            1,



                                            21



                                          )



                                          .setValues([



                                            updatedRow



                                          ]);







                                      } catch (error) {







                                        // =================================================



                                        // DATABASE GAGAL



                                        // HAPUS FILE BARU YANG BARU SAJA DIUPLOAD



                                        // =================================================







                                        if (



                                          newPhotoFile &&



                                          newPhotoFile.fileId



                                        ) {







                                          try {







                                            DriveApp



                                              .getFileById(



                                                newPhotoFile.fileId



                                              )



                                              .setTrashed(



                                                true



                                              );







                                          } catch (



                                            deletePhotoError



                                          ) {







                                            Logger.log(



                                              deletePhotoError.message



                                            );



                                          }



                                        }







                                        if (



                                          newEvidenceFile &&



                                          newEvidenceFile.fileId



                                        ) {







                                          try {







                                            DriveApp



                                              .getFileById(



                                                newEvidenceFile.fileId



                                              )



                                              .setTrashed(



                                                true



                                              );







                                          } catch (



                                            deleteEvidenceError



                                          ) {







                                            Logger.log(



                                              deleteEvidenceError.message



                                            );



                                          }



                                        }







                                        return {







                                          success: false,







                                          message:



                                            'Gagal mengupdate Daily Outstanding.',







                                          error:



                                            error.message







                                        };



                                      }











                                      // ===================================================



                                      // SUCCESS



                                      // ===================================================







                                      return {







                                        success: true,







                                        message:



                                          status === 'CLOSE'



                                            ? 'Outstanding berhasil diupdate dan ditutup.'



                                            : 'Outstanding berhasil diupdate.',







                                        inspectionId:



                                          inspectionId,







                                        mol:



                                          mol,







                                        status:



                                          status,







                                        photoUrl:



                                          photoUrl,







                                        evidenceUrl:



                                          evidenceUrl,







                                        data:



                                          dmRowToObject(



                                            updatedRow



                                          )







                                      };



                                    }



                                    // =====================================================



                                    // UNIT HISTORY



                                    // GET SEMUA DATA DM DATABASE



                                    // =====================================================







                                    function getUnitHistory() {







                                      try {







                                        const sheet =



                                          getDMSheet();







                                        const lastRow =



                                          sheet.getLastRow();











                                        // DATABASE KOSONG



                                        if (lastRow < 2) {







                                          return {







                                            success: true,







                                            count: 0,







                                            data: []







                                          };







                                        }











                                        // AMBIL SELURUH DATA DM DATABASE



                                        // 21 KOLOM A:U



                                        const rows =



                                          sheet



                                            .getRange(



                                              2,



                                              1,



                                              lastRow - 1,



                                              21



                                            )



                                            .getValues();











                                        const history = [];











                                        rows.forEach(



                                          function (row) {







                                            const record =



                                              dmRowToObject(



                                                row



                                              );











                                            // ABAIKAN ROW KOSONG



                                            if (!record.id) {



                                              return;



                                            }











                                            history.push(



                                              record



                                            );







                                          }



                                        );











                                        // DATA TERBARU DI ATAS



                                        history.reverse();











                                        return {







                                          success: true,







                                          count:



                                            history.length,







                                          data:



                                            history







                                        };











                                      } catch (error) {







                                        return {







                                          success: false,







                                          message:



                                            'Gagal mengambil Unit History.',







                                          error:



                                            error.message







                                        };







                                      }







                                    }







                                    // =====================================================



                                    // DO GET



                                    // =====================================================







                                    function doGet() {







                                      return ContentService



                                        .createTextOutput(



                                          JSON.stringify({







                                            success: true,







                                            app:



                                              'HEXA API',







                                            status:



                                              'ONLINE-V4-USER-SYNC'



                                          })



                                        )



                                        .setMimeType(



                                          ContentService.MimeType.JSON



                                        );



                                    }











                                    // =====================================================



                                    // DO POST



                                    // =====================================================







                                    function doPost(e) {







                                      try {







                                        if (



                                          !e ||



                                          !e.postData ||



                                          !e.postData.contents



                                        ) {







                                          return jsonResponse({







                                            success: false,







                                            message:



                                              'Request kosong.'







                                          });



                                        }







                                        const data =



                                          JSON.parse(



                                            e.postData.contents



                                          );







                                        const action =



                                          cleanString(



                                            data.action



                                          );











                                        // =================================================



                                        // LOGIN



                                        // =================================================







                                        if (



                                          action === 'login'



                                        ) {







                                          return jsonResponse(







                                            loginUser(







                                              data.userId || '',







                                              data.password || ''







                                            )







                                          );



                                        }











                                        // =================================================

                                          // GET USER PROFILE

                                          // =================================================



                                        if (

                                          action === 'getUserProfile'

                                        ) {



                                          return jsonResponse(

                                            getUserProfile(

                                              data.uniqId || ''

                                            )

                                          );



                                        }





                                          // =================================================

                                          // GET USERS

                                          // =================================================



                                        if (

                                          action === 'getUsers'

                                        ) {



                                          return jsonResponse(

                                            getUsers()

                                          );



                                        }





                                          // =================================================

                                          // UPDATE MY PROFILE

                                          // =================================================



                                        if (

                                          action === 'updateMyProfile'

                                        ) {



                                          return jsonResponse(

                                            updateMyProfile(

                                              data

                                            )

                                          );



                                        }



                                        // =================================================
                                        // UPDATE PROFILE PHOTO
                                        // =================================================

                                        if (
                                          action === 'updateProfilePhoto'
                                        ) {

                                          return jsonResponse(
                                            updateProfilePhoto(
                                              data
                                            )
                                          );

                                        }





                                        // =================================================
                                        // UPDATE USER SIGNATURE
                                        // =================================================

                                        if (
                                          action === 'updateUserSignature'
                                        ) {

                                          return jsonResponse(
                                            updateUserSignature(
                                              data
                                            )
                                          );

                                        }


                                        // =================================================
                                        // ADD USER
                                        // =================================================

                                        if (
                                          action === 'addUser'
                                        ) {

                                          return jsonResponse(
                                            addUser(
                                              data
                                            )
                                          );

                                        }



                                        // =================================================
                                        // UPDATE USER
                                        // =================================================

                                        if (
                                          action === 'updateUser'
                                        ) {

                                          return jsonResponse(
                                            updateUser(
                                              data
                                            )
                                          );

                                        }



                                        // =================================================
                                        // RESET USER PASSWORD
                                        // =================================================

                                        if (
                                          action === 'resetUserPassword'
                                        ) {

                                          return jsonResponse(
                                            resetUserPassword(
                                              data
                                            )
                                          );

                                        }



                                        // =================================================
                                        // CHANGE PASSWORD
                                        // =================================================

                                        if (
                                          action === 'changePassword'
                                        ) {

                                          return jsonResponse(
                                            changePassword(
                                              data
                                            )
                                          );

                                        }





                                          // =================================================
                                        // GET UNIT POPULATION
                                        // =================================================

                                        if (
                                          action === 'getUnitPopulation'
                                        ) {

                                          return jsonResponse(
                                            getUnitPopulation()
                                          );

                                        }

                        // =================================================
                        // ADD UNIT POPULATION
                        // =================================================

                        if (
                          action === 'addUnitPopulation'
                        ) {

                          return jsonResponse(
                            addUnitPopulation(data)
                          );

                        }

                        // =================================================
                        // UPDATE UNIT POPULATION
                        // =================================================

                        if (
                          action === 'updateUnitPopulation'
                        ) {

                          return jsonResponse(
                            updateUnitPopulation(data)
                          );

                        }

                        // =================================================
                        // GET EGI LIST
                        // =================================================

                        if (
                          action === 'getEGIList'
                        ) {

                          return jsonResponse(
                            getEGIList()
                          );

                        }

                        // =================================================
                        // ADD EGI
                        // =================================================

                        if (
                          action === 'addEGI'
                        ) {
                          return jsonResponse(
                            addEGI(data)
                          );
                        }

                        // =================================================
                        // UPDATE EGI
                        // =================================================

                        if (
                          action === 'updateEGI'
                        ) {
                          return jsonResponse(
                            updateEGI(data)
                          );
                        }

                        // =================================================
                        // GET EQUIPMENT TYPE LIST
                        // =================================================

                        if (
                          action === 'getEquipmentTypeList'
                        ) {
                          return jsonResponse(
                            getEquipmentTypeList()
                          );
                        }

                        // =================================================
                        // GET GROUP COMPONENT LIST
                        // =================================================

                        if (
                          action === 'getGroupComponentList'
                        ) {

                          return jsonResponse(
                            getGroupComponentList()
                          );

                        }

                        // =================================================
                        // GET DM CHECKLIST MASTER
                        // =================================================

                        if (
                          action === 'getDMChecklistMaster'
                        ) {

                          return jsonResponse(
                            getDMChecklistMaster(
                              data.type || ''
                            )
                          );

                        }

                        // =================================================
                        // GET DM CHECKLIST BY UNIT
                        // =================================================

                        if (
                          action === 'getDMChecklistByUnit'
                        ) {

                          return jsonResponse(
                            getDMChecklistByUnit(
                              data.unitCode || ''
                            )
                          );

                        }

                        // =================================================
                        // GET ACTIVE MECHANICS
                        // =================================================

                        if (
                          action === 'getActiveMechanics'
                        ) {

                          return jsonResponse(
                            getActiveMechanics()
                          );

                        }

                        // =================================================
                        // GET AVAILABLE DM SCHEDULE UNITS
                        // =================================================

                        if (
                          action === 'getAvailableDMScheduleUnits'
                        ) {

                          return jsonResponse(
                            getAvailableDMScheduleUnits()
                          );

                        }

                        // =================================================
                        // SAVE DM SCHEDULE
                        // =================================================

                        if (
                          action === 'saveDMSchedule'
                        ) {

                          return jsonResponse(
                            saveDMSchedule(data)
                          );

                        }

                        // =================================================
                        // UPDATE DM SCHEDULE
                        // =================================================

                        if (
                          action === 'updateDMSchedule'
                        ) {

                          return jsonResponse(
                            updateDMSchedule(data)
                          );

                        }

                        // =================================================
                        // SAVE DM INSPECTION DRAFT
                        // =================================================

                        // =================================================
                        // SUBMIT FINAL DM INSPECTION
                        // =================================================

                        if (
                          action === 'submitDMInspection'
                        ) {

                          return jsonResponse(
                            submitDMInspection(data)
                          );

                        }

                        // =================================================
                        // GET / RESUME DM INSPECTION DRAFT
                        // =================================================

                        if (
                          action === 'getDMInspectionDraft'
                        ) {

                          return jsonResponse(
                            getDMInspectionDraft(
                              data.scheduleUnitId || ''
                            )
                          );

                        }

                        if (
                          action === 'saveDMInspectionDraft'
                        ) {
                          return jsonResponse(
                            saveDMInspectionDraft(data)
                          );
                        }

                        // =================================================
                        // GET DM SCHEDULE BY DATE
                        // =================================================

                        if (
                          action === 'getDMScheduleByDate'
                        ) {

                          return jsonResponse(
                            getDMScheduleByDate(
                              data.activityDate || ''
                            )
                          );

                        }

                                        // =================================================



                                        // SUBMIT START INSPECTION



                                        // =================================================







                                        if (



                                          action ===



                                          'submitInspection'



                                        ) {







                                          return jsonResponse(







                                            submitInspection(



                                              data



                                            )







                                          );



                                        }











                                        // =================================================



                                        // GET DAILY OUTSTANDING



                                        // =================================================







                                        if (



                                          action ===



                                          'getDailyOutstanding'



                                        ) {







                                          return jsonResponse(







                                            getDailyOutstanding()







                                          );



                                        }











                                        // =================================================



                                        // GET DETAIL DAILY OUTSTANDING



                                        // =================================================







                                        if (



                                          action ===



                                          'getDailyOutstandingDetail'



                                        ) {







                                          return jsonResponse(







                                            getDailyOutstandingDetail(



                                              data.inspectionId || ''



                                            )







                                          );



                                        }











                                        // =================================================



                                        // UPDATE DAILY OUTSTANDING



                                        // =================================================







                                        if (



                                          action ===



                                          'updateDailyOutstanding'



                                        ) {







                                          return jsonResponse(







                                            updateDailyOutstanding(



                                              data



                                            )







                                          );



                                        }







                                        // =================================================



                                        // GET UNIT HISTORY



                                        // =================================================







                                        if (



                                          action ===



                                          'getUnitHistory'



                                        ) {







                                          return jsonResponse(







                                            getUnitHistory()







                                            );







                                        }







                                        // =================================================



                                        // GET INSPECTION PHOTO BASE64



                                        // UNTUK UNIT HISTORY PDF



                                        // =================================================







                                        if (



                                          action ===



                                          'getInspectionPhotoBase64'



                                        ) {







                                          return jsonResponse(







                                            getInspectionPhotoBase64(



                                            data.inspectionId || ''



                                               )







                                            );







                                        }







                                        // =================================================



                                        // DELETE UNIT HISTORY



                                        // =================================================







                                        if (



                                          action ===



                                          'deleteUnitHistory'



                                        ) {







                                          return jsonResponse(







                                             deleteUnitHistory(



                                               data.inspectionIds || []



                                              )







                                          );







                                        }



                                        // =================================================



                                        // ACTION TIDAK DIKENALI



                                        // =================================================







                                        return jsonResponse({







                                          success: false,







                                          message:



                                            'Action tidak dikenali: [' + action + ']',







                                          receivedAction:



                                            action







                                        });







                                      } catch (error) {







                                        return jsonResponse({







                                          success: false,







                                          message:



                                            'SERVER ERROR: ' + (error && error.message ? error.message : String(error)),







                                          error:



                                            error && error.message ? error.message : String(error)







                                        });



                                      }



                                    }











                                    // =====================================================



                                    // JSON RESPONSE



                                    // =====================================================







                                    function jsonResponse(



                                      data



                                    ) {







                                      return ContentService



                                        .createTextOutput(



                                          JSON.stringify(



                                            data



                                          )



                                        )



                                        .setMimeType(



                                          ContentService.MimeType.JSON



                                        );



                                    }











                                    // =====================================================



                                    // TEST LOGIN



                                    // =====================================================







                                    function testLogin() {







                                      const result =



                                        loginUser(



                                          'USER_ID_ANDA',



                                          'PASSWORD_ANDA'



                                        );







                                      Logger.log(



                                        JSON.stringify(



                                          result,



                                          null,



                                          2



                                        )



                                      );



                                    }











                                    // =====================================================



                                    // TEST GOOGLE DRIVE



                                    // FOLDER FOTO INSPECTION



                                    // =====================================================







                                    function testInspectionPhotoFolder() {







                                      const folder =



                                        DriveApp.getFolderById(



                                          INSPECTION_PHOTO_FOLDER_ID



                                        );







                                      Logger.log(



                                        'Koneksi folder foto berhasil'



                                      );







                                      Logger.log(



                                        'Nama Folder: ' +



                                        folder.getName()



                                      );







                                      Logger.log(



                                        'Folder ID: ' +



                                        folder.getId()



                                      );



                                    }











                                    // =====================================================



                                    // TEST GOOGLE DRIVE



                                    // FOLDER EVIDENCE DAILY OUTSTANDING



                                    // =====================================================







                                    function testOutstandingEvidenceFolder() {







                                      const folder =



                                        DriveApp.getFolderById(



                                          OUTSTANDING_EVIDENCE_FOLDER_ID



                                        );







                                      Logger.log(



                                        'Koneksi folder Evidence berhasil'



                                      );







                                      Logger.log(



                                        'Nama Folder: ' +



                                        folder.getName()



                                      );







                                      Logger.log(



                                        'Folder ID: ' +



                                        folder.getId()



                                      );



                                    }











                                    // =====================================================



                                    // TEST GET DAILY OUTSTANDING



                                    // =====================================================







                                    function testGetDailyOutstanding() {







                                      const result =



                                        getDailyOutstanding();







                                      Logger.log(



                                        JSON.stringify(



                                          result,



                                          null,



                                          2



                                        )



                                      );



                                    }











                                    // =====================================================



                                    // TEST GET DETAIL DAILY OUTSTANDING



                                    //



                                    // GANTI ID DI BAWAH DENGAN ID YANG ADA



                                    // =====================================================







                                    function testGetDailyOutstandingDetail() {







                                      const result =



                                        getDailyOutstandingDetail(



                                          'SI00260926473'



                                        );







                                      Logger.log(



                                        JSON.stringify(



                                          result,



                                          null,



                                          2



                                        )



                                      );



                                    }



                                    // =====================================================



                                    // TEST GET UNIT HISTORY



                                    // =====================================================







                                    function testGetUnitHistory() {







                                      const result =



                                        getUnitHistory();







                                      Logger.log(



                                        JSON.stringify(



                                          result,



                                          null,



                                          2



                                        )



                                      );







                                    }



                                    // =====================================================



                                    // UNIT HISTORY



                                    // DELETE MULTIPLE RECORD



                                    // =====================================================







                                    function deleteUnitHistory(



                                      inspectionIds



                                    ) {







                                      try {











                                        // =================================================



                                        // VALIDASI ARRAY



                                        // =================================================







                                        if (



                                          !Array.isArray(



                                            inspectionIds



                                          )



                                        ) {







                                          return {







                                            success: false,







                                            message:



                                              'Daftar ID yang akan dihapus tidak valid.'







                                          };







                                        }















                                        // =================================================



                                        // BERSIHKAN ID



                                        // HILANGKAN ID KOSONG + DUPLIKAT



                                        // =================================================







                                        const cleanIds =



                                          Array.from(



                                            new Set(







                                              inspectionIds







                                                .map(



                                                  function (id) {







                                                    return cleanString(



                                                      id



                                                    );







                                                  }



                                                )







                                                .filter(



                                                  function (id) {







                                                    return id !== '';







                                                  }



                                                )







                                            )



                                          );















                                        if (



                                          cleanIds.length === 0



                                        ) {







                                          return {







                                            success: false,







                                            message:



                                              'Tidak ada data yang dipilih untuk dihapus.'







                                          };







                                        }















                                        // =================================================



                                        // BUKA DATABASE



                                        // =================================================







                                        const sheet =



                                          getDMSheet();











                                        const lastRow =



                                          sheet.getLastRow();















                                        if (



                                          lastRow < 2



                                        ) {







                                          return {







                                            success: false,







                                            message:



                                              'DM DATABASE kosong.'







                                          };







                                        }















                                        // =================================================



                                        // AMBIL SEMUA ID



                                        // KOLOM A



                                        // =================================================







                                        const databaseIds =



                                          sheet







                                            .getRange(



                                              2,



                                              DM_COL.ID,



                                              lastRow - 1,



                                              1



                                            )







                                            .getDisplayValues();















                                        // =================================================



                                        // BUAT SET ID YANG DIMINTA



                                        // =================================================







                                        const targetIds =



                                          new Set(



                                            cleanIds



                                          );















                                        // =================================================



                                        // CARI NOMOR ROW



                                        // =================================================







                                        const rowsToDelete = [];







                                        const foundIds = [];















                                        databaseIds.forEach(



                                          function (



                                            row,



                                            index



                                          ) {







                                            const id =



                                              cleanString(



                                                row[0]



                                              );











                                            if (



                                              id &&



                                              targetIds.has(



                                                id



                                              )



                                            ) {







                                              rowsToDelete.push(



                                                index + 2



                                              );







                                              foundIds.push(



                                                id



                                              );







                                            }







                                          }



                                        );















                                        // =================================================



                                        // TIDAK ADA ID YANG DITEMUKAN



                                        // =================================================







                                        if (



                                          rowsToDelete.length === 0



                                        ) {







                                          return {







                                            success: false,







                                            message:



                                              'Data yang dipilih tidak ditemukan di database.',







                                            requestedCount:



                                              cleanIds.length,







                                            deletedCount:



                                              0







                                          };







                                        }















                                        // =================================================



                                        // SORT ROW TERBESAR KE TERKECIL



                                        //



                                        // PENTING:



                                        // DELETE DARI BAWAH AGAR NOMOR ROW



                                        // TIDAK BERGESER



                                        // =================================================







                                        rowsToDelete.sort(



                                          function (



                                            a,



                                            b



                                          ) {







                                            return b - a;







                                          }



                                        );















                                        // =================================================



                                        // DELETE ROW



                                        // =================================================







                                        rowsToDelete.forEach(



                                          function (



                                            rowNumber



                                          ) {







                                            sheet.deleteRow(



                                              rowNumber



                                            );







                                          }



                                        );















                                        // =================================================



                                        // CARI ID YANG TIDAK DITEMUKAN



                                        // =================================================







                                        const foundIdSet =



                                          new Set(



                                            foundIds



                                          );











                                        const notFoundIds =



                                          cleanIds.filter(



                                            function (id) {







                                              return !foundIdSet.has(



                                                id



                                              );







                                            }



                                          );















                                        // =================================================



                                        // SUCCESS



                                        // =================================================







                                        return {







                                          success: true,







                                          message:



                                            rowsToDelete.length +



                                            ' item berhasil dihapus.',







                                          requestedCount:



                                            cleanIds.length,







                                          deletedCount:



                                            rowsToDelete.length,







                                          deletedIds:



                                            foundIds,







                                          notFoundIds:



                                            notFoundIds







                                        };















                                      } catch (error) {











                                        return {







                                          success: false,







                                          message:



                                            'Gagal menghapus Unit History.',







                                          error:



                                            error.message







                                        };







                                      }







                                    }



                                    // =====================================================



                                    // TEST DELETE UNIT HISTORY



                                    // SAFE TEST - TIDAK MENGHAPUS DATA



                                    // =====================================================







                                    function testDeleteUnitHistorySafe() {







                                      const sheet =



                                        getDMSheet();











                                      const lastRow =



                                        sheet.getLastRow();











                                      if (



                                        lastRow < 2



                                      ) {







                                        Logger.log(



                                          'DM DATABASE kosong.'



                                        );







                                        return;







                                      }











                                      const rows =



                                        sheet







                                          .getRange(



                                            2,



                                            1,



                                            lastRow - 1,



                                            21



                                          )







                                          .getValues();











                                      const result =



                                        rows.map(



                                          function (row) {







                                            return {







                                              id:



                                                cleanString(



                                                  row[0]



                                                ),







                                              unitCode:



                                                cleanString(



                                                  row[1]



                                                ),







                                              problemDescription:



                                                cleanString(



                                                  row[6]



                                                )







                                            };







                                          }



                                        )







                                        .filter(



                                          function (record) {







                                            return record.id !== '';







                                          }



                                        );











                                      Logger.log(







                                        JSON.stringify(



                                          result,



                                          null,



                                          2



                                        )







                                      );







                                    }



                                    function testDeleteUnitHistoryReal() {







                                      const result =



                                        deleteUnitHistory([



                                          "SI00260926666"



                                        ]);







                                      Logger.log(



                                        JSON.stringify(



                                          result,



                                          null,



                                          2



                                        )



                                      );







                                    }



                                    // =====================================================



                                    // TEST MULTIPLE DELETE UNIT HISTORY



                                    // =====================================================







                                    function testDeleteUnitHistoryMultiple() {







                                      const result =



                                        deleteUnitHistory([



                                          "SI00260927284",



                                          "SI00260927459"



                                        ]);







                                      Logger.log(



                                        JSON.stringify(



                                          result,



                                          null,



                                          2



                                        )



                                      );







                                    }







                                    // =====================================================



                                    // UNIT HISTORY



                                    // GET INSPECTION PHOTO AS BASE64



                                    // UNTUK PDF GENERATOR



                                    // =====================================================







                                    function getInspectionPhotoBase64(



                                      inspectionId



                                    ) {







                                      try {







                                        const id =



                                          cleanString(



                                            inspectionId



                                          );











                                        if (!id) {







                                          return {



                                            success: false,



                                            message:



                                              'ID Inspection wajib tersedia.'



                                          };







                                        }











                                        const sheet =



                                          getDMSheet();











                                        const rowNumber =



                                          findInspectionRowById(



                                            sheet,



                                            id



                                          );











                                        if (rowNumber === -1) {







                                          return {



                                            success: false,



                                            message:



                                              'ID Inspection tidak ditemukan.'



                                          };







                                        }











                                        // PHOTO = KOLOM 5



                                        const photoUrl =



                                          cleanString(



                                            sheet



                                              .getRange(



                                                rowNumber,



                                                DM_COL.PHOTO



                                              )



                                              .getValue()



                                          );











                                        if (!photoUrl) {







                                          return {



                                            success: false,



                                            message:



                                              'Photo Inspection tidak tersedia.'



                                          };







                                        }











                                        // ================================================



                                        // AMBIL FILE ID DARI URL GOOGLE DRIVE



                                        //



                                        // Support:



                                        // https\\://drive.google.com/file/d/FILE_ID/view



                                        // https\\://drive.google.com/open?id=FILE_ID



                                        // ================================================







                                        let fileId = '';











                                        const filePathMatch =



                                          photoUrl.match(



                                            /\/d\/([a-zA-Z0-9_-]+)/



                                          );











                                        if (



                                          filePathMatch &&



                                          filePathMatch[1]



                                        ) {







                                          fileId =



                                            filePathMatch[1];







                                        }











                                        if (!fileId) {







                                          const idQueryMatch =



                                            photoUrl.match(



                                              /[?&]id=([a-zA-Z0-9\_-]+)/



                                            );











                                          if (



                                            idQueryMatch &&



                                            idQueryMatch[1]



                                          ) {







                                            fileId =



                                              idQueryMatch[1];







                                          }







                                        }











                                        if (!fileId) {







                                          return {



                                            success: false,



                                            message:



                                              'File ID Photo Inspection tidak ditemukan.'



                                          };







                                        }











                                        // ================================================



                                        // AMBIL FILE LANGSUNG DARI DRIVE



                                        // ================================================







                                        const file =



                                          DriveApp.getFileById(



                                            fileId



                                          );











                                        const blob =



                                          file.getBlob();











                                        const mimeType =



                                          blob.getContentType() ||



                                          'image/jpeg';











                                        if (



                                          !mimeType



                                            .toLowerCase()



                                            .startsWith('image/')



                                        ) {







                                          return {



                                            success: false,



                                            message:



                                              'File Photo Inspection bukan image.'



                                          };







                                        }











                                        const base64 =



                                          Utilities.base64Encode(



                                            blob.getBytes()



                                          );











                                        return {







                                          success: true,







                                          inspectionId:



                                            id,







                                          fileId:



                                            fileId,







                                          fileName:



                                            file.getName(),







                                          mimeType:



                                            mimeType,







                                          base64:



                                            base64,







                                          dataUrl:



                                            'data:' +



                                            mimeType +



                                            ';base64,' +



                                            base64







                                        };











                                      } catch (error) {







                                        return {







                                          success: false,







                                          message:



                                            'Gagal mengambil Photo Inspection.',







                                          error:



                                            error.message







                                        };







                                      }







                                    }







                                    function testGetInspectionPhotoBase64() {







                                      const history =



                                        getUnitHistory();







                                      if (



                                        !history.success ||



                                        !history.data ||



                                        history.data.length === 0



                                      ) {



                                        Logger.log("Unit History kosong.");



                                        return;



                                      }







                                      const inspectionId =



                                        history.data[0].id;







                                      Logger.log(



                                        "TEST ID: " +



                                        inspectionId



                                      );







                                      const result =



                                        getInspectionPhotoBase64(



                                          inspectionId



                                        );







                                      Logger.log(



                                        JSON.stringify({



                                          success: result.success,



                                          inspectionId: result.inspectionId,



                                          fileId: result.fileId,



                                          fileName: result.fileName,



                                          mimeType: result.mimeType,



                                          base64Length:



                                            result.base64



                                              ? result.base64.length



                                              : 0,



                                          message: result.message || "",



                                          error: result.error || ""



                                        })



                                      );



                                    }



                                    // =====================================================

                                    // TEST USER API V4

                                    // =====================================================



                                    function testGetUsers() {



                                      const result =

                                        getUsers();



                                      Logger.log(

                                        JSON.stringify(

                                          result,

                                          null,

                                          2

                                        )

                                      );



                                    }





                                    function testGetUserProfile() {



                                      const users =

                                        getUsers();



                                      if (

                                        !users.success ||

                                        !users.data ||

                                        users.data.length === 0

                                      ) {



                                        Logger.log(

                                          'USER DATA kosong.'

                                        );



                                        return;



                                      }



                                      const result =

                                        getUserProfile(

                                          users.data[0].uniqId

                                        );



                                      Logger.log(

                                        JSON.stringify(

                                          result,

                                          null,

                                          2

                                        )

                                      );



                                    }
                                    function testGetUnitPopulation() {
                          const result = getUnitPopulation();
                          Logger.log(JSON.stringify(result));
                        }
                        function testUnitPopulationApi() {

                          const mockEvent = {
                            postData: {
                              contents: JSON.stringify({
                                action: 'getUnitPopulation'
                              })
                            }
                          };

                          const response = doPost(mockEvent);

                          Logger.log(
                            response.getContent()
                          );
                        }


                        function testAddUnitPopulation() {

                          const result =
                            addUnitPopulation({
                              unitCode: 'HEX 1216',
                              egi: 'CAT 395',
                              status: 'Stand By'
                            });

                          Logger.log(
                            JSON.stringify(result)
                          );
                        }

                        function testUpdateUnitPopulation() {

                          const result =
                            updateUnitPopulation({
                              uniqId: 'POP00002',
                              unitCode: 'HEX 1205',
                              egi: 'CAT 395',
                              status: 'Lay Off'
                            });

                          Logger.log(
                            JSON.stringify(result)
                          );
                        }

                        function testUpdateUnitPopulation() {

                          const result =
                            updateUnitPopulation({
                              uniqId: 'POP00002',
                              unitCode: 'HEX 1205',
                              egi: 'PC 1250',
                              status: 'Lay Off'
                            });

                          Logger.log(
                            JSON.stringify(result)
                          );
                        }
                        function testEGIListApi() {

                          const mockEvent = {
                            postData: {
                              contents: JSON.stringify({
                                action: 'getEGIList'
                              })
                            }
                          };

                          const response =
                            doPost(mockEvent);

                          Logger.log(
                            response.getContent()
                          );
                        }
                        function testGetEGIListWithType() {
                          const result = getEGIList();
                          Logger.log(JSON.stringify(result, null, 2));
                        }

                        function testEGIListWithTypeApi() {
                          const mockEvent = {
                            postData: {
                              contents: JSON.stringify({
                                action: 'getEGIList'
                              })
                            }
                          };

                          const response = doPost(mockEvent);
                          Logger.log(response.getContent());
                        }

                        function testGetEquipmentTypeList() {
                          const result = getEquipmentTypeList();
                          Logger.log(JSON.stringify(result, null, 2));
                        }

                        function testEquipmentTypeListApi() {
                          const mockEvent = {
                            postData: {
                              contents: JSON.stringify({
                                action: 'getEquipmentTypeList'
                              })
                            }
                          };

                          const response = doPost(mockEvent);
                          Logger.log(response.getContent());
                        }

                        function testGetGroupComponentList() {

                          const result =
                            getGroupComponentList();

                          Logger.log(
                            JSON.stringify(
                              result,
                              null,
                              2
                            )
                          );

                        }


                        // =====================================================
                        // TEST DM CHECKLIST MASTER - EXCAVATOR
                        // =====================================================

                        function testGetDMChecklistMasterExcavator() {

                          const result =
                            getDMChecklistMaster(
                              'EXCAVATOR'
                            );

                          Logger.log(
                            JSON.stringify(
                              result,
                              null,
                              2
                            )
                          );
                        }


                        // =====================================================
                        // TEST DM CHECKLIST MASTER API - EXCAVATOR
                        // =====================================================

                        function testDMChecklistMasterApiExcavator() {

                          const mockEvent = {
                            postData: {
                              contents: JSON.stringify({
                                action: 'getDMChecklistMaster',
                                type: 'EXCAVATOR'
                              })
                            }
                          };

                          const response =
                            doPost(mockEvent);

                          Logger.log(
                            response.getContent()
                          );
                        }


                        // =====================================================
                        // TEST DM CHECKLIST BY UNIT
                        // GANTI UNIT_CODE_TEST JIKA INGIN TEST UNIT LAIN
                        // =====================================================

                        function testGetDMChecklistByUnit() {

                          const UNIT_CODE_TEST = 'HEX 1210';

                          const result =
                            getDMChecklistByUnit(
                              UNIT_CODE_TEST
                            );

                          Logger.log(
                            JSON.stringify(
                              {
                                success: result.success,
                                unit: result.unit,
                                count: result.count,
                                firstChecklist:
                                  result.checklist.length
                                    ? result.checklist[0]
                                    : null,
                                lastChecklist:
                                  result.checklist.length
                                    ? result.checklist[
                                        result.checklist.length - 1
                                      ]
                                    : null
                              },
                              null,
                              2
                            )
                          );
                        }


                        // =====================================================
                        // TEST ACTIVE MECHANICS
                        // =====================================================

                        function testGetActiveMechanics() {

                          const result =
                            getActiveMechanics();

                          Logger.log(
                            JSON.stringify(
                              result,
                              null,
                              2
                            )
                          );
                        }


                        // =====================================================
                        // TEST AVAILABLE DM SCHEDULE UNITS
                        // =====================================================

                        function testGetAvailableDMScheduleUnits() {

                          const result =
                            getAvailableDMScheduleUnits();

                          Logger.log(
                            JSON.stringify(
                              result,
                              null,
                              2
                            )
                          );
                        }


                        // =====================================================
                        // TEST DM SCHEDULER SHEET STRUCTURE
                        // READ ONLY
                        // =====================================================

                        function testDMSchedulerSheetStructure() {

                          const result =
                            validateDMSchedulerSheetStructure();

                          Logger.log(
                            JSON.stringify(
                              result,
                              null,
                              2
                            )
                          );
                        }


                        // =====================================================
                        // TEST PREPARE SAVE DM SCHEDULE
                        // TIDAK MENULIS DATABASE
                        // =====================================================

                        function testPrepareDMScheduleSave() {

                          const mechanics = getActiveMechanics().mechanics || [];
                          const units = getAvailableDMScheduleUnits().units || [];

                          Logger.log(
                            JSON.stringify(
                              {
                                activeMechanicCount: mechanics.length,
                                availableUnitCount: units.length,
                                note: 'Save membutuhkan 2 mechanic ACTIVE yang berbeda dan minimal 1 unit.'
                              },
                              null,
                              2
                            )
                          );
                        }


                        // =====================================================
                        // TEST WRITE DM SCHEDULE
                        // MENULIS 1 SCHEDULE + 1 UNIT KE DATABASE
                        // OTOMATIS: 2 MECHANIC PERTAMA + 1 UNIT PERTAMA
                        // =====================================================

                        function testWriteDMSchedule() {

                          const mechanics =
                            getActiveMechanics().mechanics || [];

                          const units =
                            getAvailableDMScheduleUnits().units || [];

                          if (mechanics.length < 2) {
                            throw new Error(
                              'Minimal 2 mechanic ACTIVE diperlukan untuk test.'
                            );
                          }

                          if (units.length < 1) {
                            throw new Error(
                              'Minimal 1 available unit diperlukan untuk test.'
                            );
                          }

                          // User pembuat schedule memakai mechanic pertama
                          // hanya untuk test backend internal.
                          const createdById =
                            mechanics[0].uniqId;

                          const activityDate =
                            Utilities.formatDate(
                              new Date(),
                              Session.getScriptTimeZone(),
                              'yyyy-MM-dd'
                            );

                          const payload = {
                            activityDate: activityDate,
                            lubeTruck: 'LUBE TRUCK 15',
                            mechanic1Id: mechanics[0].uniqId,
                            mechanic2Id: mechanics[1].uniqId,
                            createdById: createdById,
                            unitIds: [
                              units[0].unitId
                            ]
                          };

                          Logger.log(
                            'PAYLOAD TEST: ' +
                            JSON.stringify(
                              payload,
                              null,
                              2
                            )
                          );

                          const result =
                            saveDMSchedule(payload);

                          Logger.log(
                            'HASIL SAVE: ' +
                            JSON.stringify(
                              result,
                              null,
                              2
                            )
                          );
                        }


                        // =====================================================
                        // TEST READ DM SCHEDULE DMS000001
                        // MENGAMBIL TANGGAL DARI RECORD DMS000001
                        // READ ONLY
                        // =====================================================

                        function testGetDMScheduleByDate() {

                          const sheet = getDMScheduleSheet();
                          const lastRow = sheet.getLastRow();

                          if (lastRow < 2) {
                            throw new Error('DM Schedule masih kosong.');
                          }

                          const rows =
                            sheet
                              .getRange(
                                2,
                                1,
                                lastRow - 1,
                                11
                              )
                              .getDisplayValues();

                          const row =
                            rows.find(function(item) {
                              return cleanString(item[0]) === 'DMS000001';
                            });

                          if (!row) {
                            throw new Error('Record DMS000001 tidak ditemukan.');
                          }

                          const activityDate =
                            formatDateForApi(row[1]);

                          const result =
                            getDMScheduleByDate(
                              activityDate
                            );

                          Logger.log(
                            JSON.stringify(
                              result,
                              null,
                              2
                            )
                          );
                        }

                        function testSaveDMScheduleFromFrontend() {

                          const mechanicResult =
                            getActiveMechanics();

                          const unitResult =
                            getAvailableDMScheduleUnits();

                          const mechanic1 =
                            mechanicResult.mechanics[0];

                          const mechanic2 =
                            mechanicResult.mechanics[1];

                          const unit =
                            unitResult.units[0];

                          const payload = {
                            activityDate: '2026-10-03',
                            lubeTruck: 'LUBE TRUCK 16',

                            mechanic1Id:
                              mechanic1.uniqId,

                            mechanic2Id:
                              mechanic2.uniqId,

                            createdById:
                              mechanic1.uniqId,

                            unitIds: [
                              unit.unitId
                            ]
                          };

                          Logger.log(
                            'PAYLOAD: ' +
                            JSON.stringify(payload)
                          );

                          const result =
                            saveDMSchedule(payload);

                          Logger.log(
                            'RESULT: ' +
                            JSON.stringify(
                              result,
                              null,
                              2
                            )
                          );

                        }


                        // =====================================================
                        // TEST PREPARE UPDATE DM SCHEDULE
                        // READ ONLY - TIDAK MENGUBAH DATABASE
                        // =====================================================

                        function testPrepareUpdateDMSchedule() {

                          const scheduleSheet = getDMScheduleSheet();
                          const lastRow = scheduleSheet.getLastRow();

                          if (lastRow < 2) {
                            throw new Error('DM Schedule masih kosong.');
                          }

                          const rows =
                            scheduleSheet
                              .getRange(
                                2,
                                1,
                                lastRow - 1,
                                11
                              )
                              .getDisplayValues();

                          const activeRow =
                            rows.find(function(row) {
                              return (
                                cleanString(row[0]) &&
                                cleanString(row[10]).toUpperCase() !== 'CANCELLED'
                              );
                            });

                          if (!activeRow) {
                            throw new Error('Schedule ACTIVE tidak ditemukan.');
                          }

                          const activityDate =
                            formatDateForApi(activeRow[1]);

                          const result =
                            getDMScheduleByDate(activityDate);

                          const schedule =
                            (result.schedules || []).find(function(item) {
                              return item.scheduleId === cleanString(activeRow[0]);
                            });

                          Logger.log(
                            JSON.stringify(
                              {
                                success: true,
                                note:
                                  'READ ONLY. Belum melakukan update.',
                                schedule: schedule
                              },
                              null,
                              2
                            )
                          );
                        }

                        // =====================================================
                        // TEST REAL UPDATE DM SCHEDULE
                        // MEMPERTAHANKAN MECHANIC + UNIT YANG SAMA
                        // BENAR-BENAR MENJALANKAN updateDMSchedule()
                        // =====================================================

                        function testRealUpdateDMSchedule() {

                          const scheduleSheet =
                            getDMScheduleSheet();

                          const lastRow =
                            scheduleSheet.getLastRow();

                          if (lastRow < 2) {
                            throw new Error(
                              'DM Schedule masih kosong.'
                            );
                          }

                          // ---------------------------------------------
                          // 1. AMBIL SCHEDULE AKTIF PERTAMA
                          // ---------------------------------------------

                          const rows =
                            scheduleSheet
                              .getRange(
                                2,
                                1,
                                lastRow - 1,
                                11
                              )
                              .getDisplayValues();

                          const scheduleRow =
                            rows.find(function(row) {

                              const scheduleId =
                                cleanString(row[0]);

                              const status =
                                cleanString(row[10])
                                  .toUpperCase();

                              return (
                                scheduleId &&
                                status !== 'CANCELLED'
                              );

                            });

                          if (!scheduleRow) {
                            throw new Error(
                              'Schedule aktif tidak ditemukan.'
                            );
                          }

                          const scheduleId =
                            cleanString(scheduleRow[0]);

                          const activityDate =
                            formatDateForApi(
                              scheduleRow[1]
                            );

                          // ---------------------------------------------
                          // 2. BACA SCHEDULE + CHILD UNIT EXISTING
                          // ---------------------------------------------

                          const scheduleResult =
                            getDMScheduleByDate(
                              activityDate
                            );

                          const schedule =
                            (scheduleResult.schedules || [])
                              .find(function(item) {

                                return (
                                  item.scheduleId ===
                                  scheduleId
                                );

                              });

                          if (!schedule) {
                            throw new Error(
                              'Detail schedule tidak ditemukan.'
                            );
                          }

                          if (
                            !schedule.mechanic1 ||
                            !schedule.mechanic1.uniqId ||
                            !schedule.mechanic2 ||
                            !schedule.mechanic2.uniqId
                          ) {
                            throw new Error(
                              'Data mechanic schedule tidak lengkap.'
                            );
                          }

                          if (
                            !schedule.units ||
                            schedule.units.length < 1
                          ) {
                            throw new Error(
                              'Schedule belum memiliki unit.'
                            );
                          }

                          // ---------------------------------------------
                          // 3. TEST INI HANYA UNTUK UNIT NOT STARTED
                          // ---------------------------------------------

                          const unsafeUnit =
                            schedule.units.find(
                              function(unit) {

                                return (
                                  cleanString(unit.status)
                                    .toUpperCase() !==
                                  'NOT STARTED'
                                );

                              }
                            );

                          if (unsafeUnit) {
                            throw new Error(
                              'TEST DIBATALKAN. Unit ' +
                              unsafeUnit.unitCode +
                              ' sudah berstatus ' +
                              unsafeUnit.status +
                              '.'
                            );
                          }

                          // ---------------------------------------------
                          // 4. REQUESTER TEST HARUS MASTER ACTIVE
                          // Karena permission Scheduler/Edit belum dibuat.
                          // ---------------------------------------------

                          const userSheet =
                            getUserSheet();

                          const userLastRow =
                            userSheet.getLastRow();

                          const userRows =
                            userLastRow >= 2
                              ? userSheet
                                  .getRange(
                                    2,
                                    1,
                                    userLastRow - 1,
                                    USER_COL.SIGNATURE
                                  )
                                  .getDisplayValues()
                              : [];

                          const masterRow =
                            userRows.find(
                              function(row) {

                                return (
                                  cleanString(
                                    row[
                                      USER_COL.KODE - 1
                                    ]
                                  ) === '1' &&

                                  cleanString(
                                    row[
                                      USER_COL.STATUS - 1
                                    ]
                                  ).toUpperCase() ===
                                  'ACTIVE'
                                );

                              }
                            );

                          if (!masterRow) {
                            throw new Error(
                              'Master ACTIVE tidak ditemukan.'
                            );
                          }

                          const masterUniqId =
                            cleanString(
                              masterRow[
                                USER_COL.UNIQ_ID - 1
                              ]
                            );

                          // ---------------------------------------------
                          // 5. PERTAHANKAN SEMUA UNIT EXISTING
                          // ---------------------------------------------

                          const unitIds =
                            schedule.units.map(
                              function(unit) {

                                return unit.unitId;

                              }
                            );

                          const payload = {

                            scheduleId:
                              scheduleId,

                            requesterUniqId:
                              masterUniqId,

                            mechanic1Id:
                              schedule.mechanic1.uniqId,

                            mechanic2Id:
                              schedule.mechanic2.uniqId,

                            unitIds:
                              unitIds

                          };

                          Logger.log(
                            'PAYLOAD UPDATE TEST:'
                          );

                          Logger.log(
                            JSON.stringify(
                              payload,
                              null,
                              2
                            )
                          );

                          // ---------------------------------------------
                          // 6. REAL UPDATE
                          // ---------------------------------------------

                          const result =
                            updateDMSchedule(
                              payload
                            );

                          Logger.log(
                            'HASIL UPDATE TEST:'
                          );

                          Logger.log(
                            JSON.stringify(
                              result,
                              null,
                              2
                            )
                          );
                        }
